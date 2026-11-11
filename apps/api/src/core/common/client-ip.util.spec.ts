import { Request } from 'express';
import {
  hasForwardedFor,
  isInternalRequest,
  isPrivateAddress,
  getSocketIp,
} from './client-ip.util';

function buildRequest(options: {
  remoteAddress?: string;
  forwardedFor?: string | string[];
  ip?: string;
}): Request {
  return {
    ip: options.ip,
    socket: { remoteAddress: options.remoteAddress ?? '' },
    headers: options.forwardedFor
      ? { 'x-forwarded-for': options.forwardedFor }
      : {},
  } as unknown as Request;
}

describe('client-ip.util', () => {
  describe('isPrivateAddress', () => {
    it('reconoce rangos privados y loopback', () => {
      expect(isPrivateAddress('10.1.2.3')).toBe(true);
      expect(isPrivateAddress('172.18.0.5')).toBe(true);
      expect(isPrivateAddress('172.32.0.5')).toBe(false);
      expect(isPrivateAddress('192.168.1.10')).toBe(true);
      expect(isPrivateAddress('127.0.0.1')).toBe(true);
      expect(isPrivateAddress('::1')).toBe(true);
      expect(isPrivateAddress('::ffff:172.18.0.5')).toBe(true);
      expect(isPrivateAddress('8.8.8.8')).toBe(false);
    });
  });

  describe('hasForwardedFor', () => {
    it('detecta la cabecera aunque venga vacia o en lista', () => {
      expect(hasForwardedFor(buildRequest({ forwardedFor: '1.2.3.4' }))).toBe(true);
      expect(hasForwardedFor(buildRequest({ forwardedFor: ['1.2.3.4'] }))).toBe(true);
      expect(hasForwardedFor(buildRequest({ forwardedFor: '  ' }))).toBe(false);
      expect(hasForwardedFor(buildRequest({}))).toBe(false);
    });
  });

  describe('getSocketIp', () => {
    it('usa la direccion del socket', () => {
      expect(getSocketIp(buildRequest({ remoteAddress: '172.18.0.4' }))).toBe('172.18.0.4');
    });
  });

  describe('isInternalRequest', () => {
    it('trata como interno al render SSR (red interna sin X-Forwarded-For)', () => {
      expect(isInternalRequest(buildRequest({ remoteAddress: '172.18.0.4' }))).toBe(true);
    });

    it('trata como externo al trafico que pasa por nginx', () => {
      const req = buildRequest({
        remoteAddress: '172.18.0.3',
        forwardedFor: '203.0.113.9',
        ip: '203.0.113.9',
      });
      expect(isInternalRequest(req)).toBe(false);
    });

    it('no se deja engañar por un X-Forwarded-For falsificado', () => {
      const req = buildRequest({
        remoteAddress: '203.0.113.9',
        forwardedFor: '8.8.8.8',
        ip: '8.8.8.8',
      });
      expect(isInternalRequest(req)).toBe(false);
    });

    it('descarta trafico sin cabecera pero desde una IP publica', () => {
      expect(
        isInternalRequest(buildRequest({ remoteAddress: '203.0.113.9', ip: '203.0.113.9' })),
      ).toBe(false);
    });
  });
});
