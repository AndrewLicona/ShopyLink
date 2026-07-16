import { Global, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as net from 'node:net';
import { URL } from 'node:url';

type RedisReply = string | number | null | RedisReply[];

type PendingRequest = {
  resolve: (value: RedisReply) => void;
  reject: (error: Error) => void;
};

type ParsedUrl = {
  host: string;
  port: number;
  password?: string;
  db: number;
};

function parseRedisUrl(): ParsedUrl {
  const rawUrl =
    process.env.REDIS_URL ||
    process.env.REDIS_CONNECTION_STRING ||
    'redis://127.0.0.1:6379/0';

  const parsed = new URL(rawUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || '6379'),
    password: parsed.password || undefined,
    db: Number(parsed.pathname.replace('/', '') || '0'),
  };
}

function encodeCommand(args: Array<string | number>): Buffer {
  const chunks: Buffer[] = [Buffer.from(`*${args.length}\r\n`)];

  for (const arg of args) {
    const value = Buffer.from(String(arg));
    chunks.push(Buffer.from(`$${value.length}\r\n`), value, Buffer.from('\r\n'));
  }

  return Buffer.concat(chunks);
}

function readLine(buffer: Buffer, start: number): { line: string; next: number } | null {
  const end = buffer.indexOf('\r\n', start);
  if (end === -1) return null;
  return {
    line: buffer.toString('utf8', start, end),
    next: end + 2,
  };
}

function parseReply(buffer: Buffer, start = 0): { value: RedisReply; next: number } | null {
  if (start >= buffer.length) return null;

  const type = String.fromCharCode(buffer[start]);

  if (type === '+' || type === '-' || type === ':') {
    const line = readLine(buffer, start + 1);
    if (!line) return null;

    if (type === '-') {
      throw new Error(line.line);
    }

    if (type === ':') {
      return { value: Number(line.line), next: line.next };
    }

    return { value: line.line, next: line.next };
  }

  if (type === '$') {
    const line = readLine(buffer, start + 1);
    if (!line) return null;

    const length = Number(line.line);
    if (Number.isNaN(length)) {
      throw new Error(`Invalid bulk length: ${line.line}`);
    }
    if (length === -1) {
      return { value: null, next: line.next };
    }

    const end = line.next + length;
    if (buffer.length < end + 2) return null;

    return {
      value: buffer.toString('utf8', line.next, end),
      next: end + 2,
    };
  }

  if (type === '*') {
    const line = readLine(buffer, start + 1);
    if (!line) return null;

    const count = Number(line.line);
    if (Number.isNaN(count)) {
      throw new Error(`Invalid array length: ${line.line}`);
    }
    if (count === -1) {
      return { value: null, next: line.next };
    }

    const items: RedisReply[] = [];
    let cursor = line.next;
    for (let i = 0; i < count; i += 1) {
      const parsed = parseReply(buffer, cursor);
      if (!parsed) return null;
      items.push(parsed.value);
      cursor = parsed.next;
    }

    return { value: items, next: cursor };
  }

  throw new Error(`Unsupported Redis reply type: ${type}`);
}

@Global()
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly parsedUrl = parseRedisUrl();
  private socket: net.Socket | null = null;
  private connectPromise: Promise<void> | null = null;
  private readonly pending: PendingRequest[] = [];
  private buffer = Buffer.alloc(0);
  private readonly memoryFallback = new Map<string, { value: string; expiresAt?: number }>();
  private fallbackMode = !process.env.REDIS_URL && !process.env.REDIS_CONNECTION_STRING;
  private warnedFallback = false;

  async onModuleDestroy() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
  }

  private async connect(): Promise<void> {
    if (this.fallbackMode) return;
    if (this.socket?.destroyed === false) return;
    if (!this.connectPromise) {
      this.connectPromise = new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({
          host: this.parsedUrl.host,
          port: this.parsedUrl.port,
        });

        socket.setNoDelay(true);
        socket.on('connect', () => {
          this.socket = socket;
          this.buffer = Buffer.alloc(0);
          resolve();
        });
        socket.on('data', (chunk) => this.handleData(chunk));
        socket.on('error', (error) => {
          this.handleSocketError(error);
          reject(error);
        });
        socket.on('close', () => {
          this.socket = null;
        });
      }).finally(() => {
        this.connectPromise = null;
      });
    }

    await this.connectPromise;

    if (this.parsedUrl.password) {
      await this.exec(['AUTH', this.parsedUrl.password]);
    }

    if (Number.isFinite(this.parsedUrl.db) && this.parsedUrl.db > 0) {
      await this.exec(['SELECT', this.parsedUrl.db]);
    }
  }

  private handleData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.pending.length > 0) {
      const parsed = parseReply(this.buffer);
      if (!parsed) return;

      this.buffer = this.buffer.subarray(parsed.next);
      const request = this.pending.shift();
      request?.resolve(parsed.value);
    }
  }

  private handleSocketError(error: Error) {
    while (this.pending.length > 0) {
      this.pending.shift()?.reject(error);
    }
  }

  private async exec(args: Array<string | number>): Promise<RedisReply> {
    if (this.fallbackMode) {
      return this.execInMemory(args);
    }

    try {
      await this.connect();

      return await new Promise<RedisReply>((resolve, reject) => {
        if (!this.socket || this.socket.destroyed) {
          reject(new Error('Redis socket is not connected'));
          return;
        }

        this.pending.push({ resolve, reject });
        this.socket.write(encodeCommand(args));
      });
    } catch (error) {
      this.fallbackMode = true;
      if (!this.warnedFallback) {
        this.logger.warn(
          'Redis is unavailable. Falling back to in-memory cache until the connection recovers.',
        );
        this.warnedFallback = true;
      }

      return this.execInMemory(args);
    }
  }

  private execInMemory(args: Array<string | number>): RedisReply {
    const [command, ...rest] = args;
    const name = String(command).toUpperCase();

    if (name === 'GET') {
      const entry = this.memoryFallback.get(String(rest[0]));
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        this.memoryFallback.delete(String(rest[0]));
        return null;
      }
      return entry.value;
    }

    if (name === 'SET' || name === 'SETEX') {
      const key = String(rest[0]);
      const value = String(rest[1] ?? '');
      let ttlSeconds: number | undefined;

      if (name === 'SETEX') {
        ttlSeconds = Number(rest[1]);
      } else {
        const exIndex = rest.findIndex((item) => String(item).toUpperCase() === 'EX');
        if (exIndex >= 0) {
          ttlSeconds = Number(rest[exIndex + 1]);
        }
      }

      this.memoryFallback.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
      return 'OK';
    }

    if (name === 'DEL') {
      let removed = 0;
      for (const key of rest) {
        if (this.memoryFallback.delete(String(key))) {
          removed += 1;
        }
      }
      return removed;
    }

    if (name === 'INCR') {
      const key = String(rest[0]);
      const current = Number(this.execInMemory(['GET', key]) || '0') || 0;
      const next = current + 1;
      this.memoryFallback.set(key, { value: String(next) });
      return next;
    }

    throw new Error(`Unsupported in-memory Redis command: ${name}`);
  }

  async get<T = string>(key: string): Promise<T | null> {
    const reply = await this.exec(['GET', key]);
    if (reply === null) return null;
    return reply as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.exec(['SET', key, payload, 'EX', ttlSeconds]);
      return;
    }
    await this.exec(['SET', key, payload]);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get<string>(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, value, ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    const reply = await this.exec(['DEL', ...keys]);
    return typeof reply === 'number' ? reply : Number(reply || 0);
  }

  async incr(key: string): Promise<number> {
    const reply = await this.exec(['INCR', key]);
    return typeof reply === 'number' ? reply : Number(reply || 0);
  }

  async getOrSetJson<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached) {
      return cached;
    }

    const value = await factory();
    await this.setJson(key, value, ttlSeconds);
    return value;
  }
}
