#!/bin/sh
set -eu

cert_dir=/etc/nginx/certs
local_ip=${LOCAL_HTTPS_IP:-192.168.137.1}
mkdir -p "$cert_dir"

case "$local_ip" in
  ''|*[!0-9.]*)
    echo "LOCAL_HTTPS_IP must be an IPv4 address." >&2
    exit 1
    ;;
esac
if ! printf '%s\n' "$local_ip" | awk -F. 'NF == 4 { for (i = 1; i <= 4; i++) if ($i !~ /^[0-9]+$/ || $i > 255) exit 1; next } { exit 1 }'; then
  echo "LOCAL_HTTPS_IP must be a valid IPv4 address." >&2
  exit 1
fi

if [ ! -f "$cert_dir/ca.crt" ] && [ ! -f "$cert_dir/ca.key" ]; then
  echo "Creating a local certificate authority..."
  openssl req -x509 -newkey rsa:3072 -sha256 -days 3650 -nodes \
    -keyout "$cert_dir/ca.key" \
    -out "$cert_dir/ca.crt" \
    -subj "/CN=Quiz Portal Local CA" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -addext "subjectKeyIdentifier=hash"
  chmod 600 "$cert_dir/ca.key"
elif [ ! -s "$cert_dir/ca.crt" ] || [ ! -s "$cert_dir/ca.key" ]; then
  echo "The local CA files are incomplete in $cert_dir; restore both ca.crt and ca.key." >&2
  exit 1
fi

server_cert_valid=false
if [ -s "$cert_dir/server.crt" ] && [ -s "$cert_dir/server.key" ] \
  && openssl verify -CAfile "$cert_dir/ca.crt" "$cert_dir/server.crt" >/dev/null 2>&1 \
  && openssl x509 -in "$cert_dir/server.crt" -noout -checkip "$local_ip" >/dev/null 2>&1 \
  && openssl x509 -in "$cert_dir/server.crt" -noout -checkhost localhost >/dev/null 2>&1; then
  server_cert_valid=true
fi

if [ "$server_cert_valid" != true ]; then
  echo "Creating the HTTPS server certificate for localhost and $local_ip..."
  openssl req -new -newkey rsa:2048 -sha256 -nodes \
    -keyout "$cert_dir/server.key" \
    -out "$cert_dir/server.csr" \
    -subj "/CN=$local_ip"
  cat > "$cert_dir/server.ext" <<EOF
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$local_ip
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
EOF
  openssl x509 -req -in "$cert_dir/server.csr" \
    -CA "$cert_dir/ca.crt" \
    -CAkey "$cert_dir/ca.key" \
    -CAcreateserial \
    -out "$cert_dir/server.crt" \
    -days 825 \
    -sha256 \
    -extfile "$cert_dir/server.ext"
  rm -f "$cert_dir/server.csr" "$cert_dir/server.ext"
  chmod 600 "$cert_dir/server.key"
fi

exec nginx -g 'daemon off;'
