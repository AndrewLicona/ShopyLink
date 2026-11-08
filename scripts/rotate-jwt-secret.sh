#!/bin/bash
# Rotacion del secreto de firma de suplantacion (JWT_SECRET).
#
# Que cambia y que NO cambia:
#   - Se invalida unicamente los tokens de suplantacion emitidos en la ultima
#     hora (duracion 1 h). El super admin vuelve a entrar en modo suplantacion.
#   - Las sesiones de los usuarios NO cambian: la API valida los tokens de
#     acceso de Supabase contra su JWKS, no contra este secreto.
#   - No se toca ningun dato de la base de datos.
#
# Uso (en el servidor, como el usuario que puede docker compose):
#   bash scripts/rotate-jwt-secret.sh
set -euo pipefail

SECRETS="${SECRETS:-/etc/dokploy/secrets/shopylink.env}"
PROJECT="${PROJECT:-shopylinks-stack-k339he}"
SERVICE="${SERVICE:-api}"
STACK_DIR="${STACK_DIR:-/etc/dokploy/compose/$PROJECT/code}"

if [ ! -f "$SECRETS" ]; then
  echo "ERROR: no existe el archivo de secretos $SECRETS"
  exit 1
fi

BACKUP="$SECRETS.bak.$(date +%Y%m%d%H%M%S)"
cp -p "$SECRETS" "$BACKUP"
echo "Copia de seguridad: $BACKUP"

NEW_SECRET=$(openssl rand -base64 32)
if [ ${#NEW_SECRET} -lt 32 ]; then
  echo "ERROR: no se genero un secreto valido"
  exit 1
fi

# Reemplaza la linea JWT_SECRET=... (o la agrega si no existe) sin mostrar
# el valor antiguo.
if grep -q '^JWT_SECRET=' "$SECRETS"; then
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=\"$NEW_SECRET\"|" "$SECRETS"
  echo "OK: JWT_SECRET reemplazado"
else
  printf 'JWT_SECRET="%s"\n' "$NEW_SECRET" >> "$SECRETS"
  echo "OK: JWT_SECRET agregado"
fi

chmod 600 "$SECRETS"

# Recrea solo la API para que tome la clave nueva.
cd "$STACK_DIR"
docker compose -p "$PROJECT" --env-file .env -f ./docker-compose.yml up -d --no-deps --force-recreate "$SERVICE"

echo "API recreada. Esperando 10 s..."
sleep 10

echo "=== verificacion ==="
docker inspect "${PROJECT}-${SERVICE}-1" --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep -c '^JWT_SECRET=' | sed 's/^/JWT_SECRET en el contenedor (ocurrencias): /'
docker logs --tail 20 "${PROJECT}-${SERVICE}-1" 2>&1 | grep -E '\[auth\]|\[encryption\]' | tail -n 4
code=$(curl -s -o /dev/null -w '%{http_code}' https://shopylinks.shop/api/stores/marketplace/public)
echo "API marketplace: $code"

echo
echo "Si necesitas volver atras: cp -p $BACKUP $SECRETS y recrea la API."
