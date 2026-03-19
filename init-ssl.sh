#!/bin/bash

# Configurações
DOMAINS="vinidev.com.br www.vinidev.com.br"
EMAIL="admin@vinidev.com.br"
STAGING=0 # Coloque 1 para testar sem limites do Let's Encrypt

if [ -d "certbot/conf/live/$DOMAINS" ]; then
  echo "Certificados já existem. Ignorando inicialização."
  exit 0
fi

echo "### Criando pasta temporária para certbot..."
docker compose run --rm --entrypoint "\
  mkdir -p /var/www/certbot" certbot

echo "### Iniciando Nginx..."
docker compose up -d nginx

echo "### Requisitando certificado SSL para $DOMAINS..."
staging_arg=""
if [ $STAGING != 0 ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $EMAIL \
    -d $DOMAINS \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "### Recarregando Nginx..."
docker compose exec nginx nginx -s reload
