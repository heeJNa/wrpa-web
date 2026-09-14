#!/bin/bash
# 사용법
#   ./deploy.sh                 # 로컬 모드: 이 머신(VM)에서 빌드하고 바로 컨테이너 교체
#   ./deploy.sh <USER> <HOST>   # 원격 모드: 로컬에서 빌드 → scp 업로드 → 원격에서 컨테이너 교체
set -e

USER="$1"
HOST="$2"

if [ -n "$USER$HOST" ] && { [ -z "$USER" ] || [ -z "$HOST" ]; }; then
  echo "Usage: $0 [<USER> <HOST>]"
  exit 1
fi

echo "Building Docker image..."
docker build -t wrpa-app:latest .

if [ -z "$HOST" ]; then
  echo "Deploying on this host..."
  docker rm -f wrpa-app || true
  docker run -d --name wrpa-app -p 3000:3000 --network=woori-net wrpa-app:latest
  echo "Deployment complete (local)!"
  exit 0
fi

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

echo "Deployment complete (remote)!"
