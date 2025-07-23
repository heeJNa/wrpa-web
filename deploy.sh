#!/bin/bash
set -e

USER="$1"
HOST="$2"

if [ -z "$USER" ] || [ -z "$HOST" ]; then
  echo "❌ Usage: $0 <USER> <HOST>"
  exit 1
fi

echo "🔧 Building Docker image..."
docker build -t wrpa-app:latest .

echo "📦 Saving image..."
docker save wrpa-app:latest | gzip > wrpa-app.tar.gz

echo "🚀 Uploading to ${USER}@${HOST}..."
# scp wrpa-app.tar.gz ${USER}@${HOST}:~/

echo "🔄 Deploying on remote host..."
# ssh ${USER}@${HOST} <<'EOF'
docker load < wrpa-app.tar.gz
docker rm -f nuxt-container || true
docker run -d --name wrpa-app -p 80:3000 wrpa-app:latest
# EOF

echo "✅ Deployment complete!"