import { Request } from 'express';

/**
 * Rango privado (RFC1918) + loopback + link-local. El trafico que llega al
 * contenedor de la API desde la red interna de Docker o desde localhost.
 */
const PRIVATE_IPV4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
const PRIVATE_IPV6 = /^(::1|fc|fd|fe80)/i;

export function getSocketIp(req: Request): string {
  return req.socket?.remoteAddress ?? req.ip ?? 'unknown';
}

export function hasForwardedFor(req: Request): boolean {
  const header = req.headers['x-forwarded-for'];
  if (Array.isArray(header)) return header.some((value) => value.trim().length > 0);
  return typeof header === 'string' && header.trim().length > 0;
}

export function isPrivateAddress(address: string): boolean {
  const bare = address.startsWith('::ffff:') ? address.slice(7) : address;
  return PRIVATE_IPV4.test(bare) || PRIVATE_IPV6.test(bare);
}

/**
 * El render SSR del contenedor web llama a la API por la red interna
 * (`http://api:3001/api`), sin pasar por nginx. Todo lo que entra por nginx
 * llega SIEMPRE con `X-Forwarded-For` (nginx lo agrega con `$proxy_add_x_forwarded_for`,
 * aunque el cliente mande uno propio), asi que la ausencia de esa cabecera
 * distingue el trafico interno del trafico real de los visitantes.
 */
export function isInternalRequest(req: Request): boolean {
  if (hasForwardedFor(req)) return false;
  return isPrivateAddress(getSocketIp(req));
}
