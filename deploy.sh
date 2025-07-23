#!/bin/bash
set -e

echo "1. Build Docker image locally"
docker build -t wrpa-web:latest .

echo "2. Save image"
docker save wrpa-web:latest | gzip > wrpa-web.tar.gz

# echo "3. Upload and deploy to server"
# scp wrpa-web.tar.gz "${USER}@${HOST}:~/"

# ssh "${USER}@${HOST}" <<'EOF'
docker load < wrpa-web.tar.gz
docker rm -f nuxt-container || true
docker run -d --name nuxt-container -p 80:3000 wrpa-web:latest
# EOF

echo "✅ Deployment complete!"