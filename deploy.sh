#!/bin/bash
set -e

USER="$1"
HOST="$2"

if [ -z "$USER" ] || [ -z "$HOST" ]; then
  echo "Usage: $0 <USER> <HOST>"
  exit 1
fi

echo "Building Docker image..."
docker build -t wrpa-app:latest .

echo "Saving image..."
docker save wrpa-app:latest | gzip > wrpa-app.tar.gz

echo "Uploading to ${USER}@${HOST}..."
scp wrpa-app.tar.gz ${USER}@${HOST}:~/

echo "Deploying on remote host..."
ssh ${USER}@${HOST} <<'EOF'
docker load < wrpa-app.tar.gz
docker rm -f wrpa-app || true
docker run -d --name wrpa-app -p 3000:3000 --network=woori-net wrpa-app:latest
EOF

echo "Deployment complete!"
