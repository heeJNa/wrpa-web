#!/bin/bash
set -e

echo "1. Build Docker image locally"
docker build -t nuxt-app:latest .

echo "2. Save image"
docker save nuxt-app:latest | gzip > nuxt-app.tar.gz

echo "3. Upload and deploy to server"
scp nuxt-app.tar.gz "${USER}@${HOST}:~/"

ssh "${USER}@${HOST}" <<'EOF'
  docker load < nuxt-app.tar.gz
  docker rm -f nuxt-container || true
  docker run -d --name nuxt-container -p 80:3000 nuxt-app:latest
EOF

echo "✅ Deployment complete!"