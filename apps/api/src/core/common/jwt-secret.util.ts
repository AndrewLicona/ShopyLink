/**
 * Secreto de firma de los tokens de suplantacion.
 *
 * `JWT_SECRET` solo se usa para firmar y verificar los tokens de
 * suplantacion (duracion 1 hora). Las sesiones de los usuarios NO dependen de
 * esta clave: la API valida los tokens de acceso de Supabase contra su JWKS.
 *
 * Por eso la clave vive FUERA del repositorio, en el mismo archivo de secretos
 * que la clave de cifrado:
 *   /etc/dokploy/secrets/shopylink.env
 *
 * Nunca se usa un valor por defecto: firmar con una clave conocida permitiria
 * forjar un token de suplantacion.
 */
export class MissingJwtSecretError extends Error {
  constructor() {
    super(
      'JWT_SECRET is not set. Refusing to sign or verify impersonation tokens. ' +
        'Define it in the environment before starting the API.',
    );
    this.name = 'MissingJwtSecretError';
  }
}

/** Devuelve el secreto de firma o falla de forma explicita. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new MissingJwtSecretError();
  }

  return secret;
}

/**
 * Reporta la configuracion en el arranque.
 *
 * No bloquea la API: la clave solo hace falta para la suplantacion. Si falta,
 * el modo super admin no podra iniciar sesiones de suplantacion y el log
 * dice exactamente que hacer.
 */
export function assertJwtSecretConfigured(): void {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    console.log('[auth] JWT_SECRET configurada.');
    return;
  }

  console.error(
    '[auth] ERROR: JWT_SECRET no esta definida. La suplantacion quedara ' +
      'deshabilitada. Definela en el entorno (en el servidor: ' +
      '/etc/dokploy/secrets/shopylink.env) y reinicia la API.',
  );
}
