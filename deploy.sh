#!/bin/bash
# 사용법
#   ./deploy.sh                                   # 로컬 모드: 이 머신(VM)에서 빌드하고 바로 컨테이너 교체
#   ./deploy.sh <USER> <HOST>                     # 원격 모드: 로컬에서 빌드 → scp 업로드 → 원격에서 컨테이너 교체
#   ./deploy.sh --list [<USER> <HOST>]            # 지금 떠 있는 판과 되돌릴 수 있는 태그 목록
#   ./deploy.sh --rollback <TAG> [<USER> <HOST>]  # 빌드 없이 그 태그로 되돌린다
#
# 이미지는 커밋 해시(예: wrpa-app:d8365c8)와 wrpa-app:latest 두 개로 태그한다.
# latest 하나만 쓰면 새로 올린 판이 깨졌을 때 돌아갈 판이 남지 않는다.
# 코드를 가져오는 일은 하지 않는다 — 현재 디렉터리를 그대로 빌드하므로 먼저 git pull 할 것.
set -e

# 기본값은 운영 기준. 환경변수로 덮을 수 있어 스테이징·리허설에 그대로 쓸 수 있다.
#   DEPLOY_PORT=3001 DEPLOY_CONTAINER=wrpa-app-staging ./deploy.sh
IMAGE="${DEPLOY_IMAGE:-wrpa-app}"
CONTAINER="${DEPLOY_CONTAINER:-wrpa-app}"
PORT="${DEPLOY_PORT:-3000}"
NETWORK="${DEPLOY_NETWORK:-woori-net}"
KEEP="${DEPLOY_KEEP:-5}" # 이미지 태그를 몇 개까지 남길지(그 이전 것은 빌드 후 정리)

usage() {
  cat >&2 <<'USAGE'
Usage:
  ./deploy.sh                                   로컬 빌드 + 교체
  ./deploy.sh <USER> <HOST>                     로컬 빌드 → 업로드 → 원격 교체
  ./deploy.sh --list [<USER> <HOST>]            현재 판과 되돌릴 수 있는 태그 목록
  ./deploy.sh --rollback <TAG> [<USER> <HOST>]  빌드 없이 그 태그로 되돌리기
USAGE
  exit 1
}

MODE=deploy
TAG=""

case "${1:-}" in
  --list)
    MODE=list
    shift
    ;;
  --rollback)
    MODE=rollback
    TAG="${2:-}"
    [ -n "$TAG" ] || usage
    shift 2
    ;;
  -h | --help)
    usage
    ;;
esac

SSH_USER="${1:-}"
SSH_HOST="${2:-}"

# USER·HOST 는 둘 다 주거나 둘 다 빼야 한다
if [ -n "${SSH_USER}${SSH_HOST}" ] && { [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ]; }; then
  usage
fi

# 표준입력으로 받은 스크립트를 대상 호스트에서 실행한다.
# 원격이든 로컬이든 같은 내용을 돌려 두 경로가 갈라지지 않게 한다.
run_on_target() {
  if [ -n "$SSH_HOST" ]; then
    ssh "${SSH_USER}@${SSH_HOST}" bash -s -- "$@"
  else
    bash -s -- "$@"
  fi
}

swap_script() {
  cat <<'SCRIPT'
set -e
IMAGE="$1"; CONTAINER="$2"; TAG="$3"; PORT="$4"; NETWORK="$5"
if ! docker image inspect "${IMAGE}:${TAG}" >/dev/null 2>&1; then
  echo "이미지가 없습니다: ${IMAGE}:${TAG}" >&2
  echo "'./deploy.sh --list' 로 남아 있는 태그를 확인하세요." >&2
  exit 1
fi
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" -p "${PORT}:3000" --network="$NETWORK" "${IMAGE}:${TAG}" >/dev/null
# 되돌린 판도 latest 가 가리키게 해서 '지금 떠 있는 것 = latest' 를 유지한다
docker tag "${IMAGE}:${TAG}" "${IMAGE}:latest"
echo "실행 중: ${IMAGE}:${TAG}"
SCRIPT
}

list_script() {
  cat <<'SCRIPT'
IMAGE="$1"; CONTAINER="$2"
# docker inspect 는 대상이 없으면 stdout 에 빈 줄을 흘리므로 값을 받아서 판단한다
running="$(docker inspect -f '{{.Config.Image}}  (시작 {{.State.StartedAt}})' "$CONTAINER" 2>/dev/null || true)"
echo "지금 떠 있는 판:"
[ -n "$running" ] && echo "  $running" || echo "  (컨테이너 없음)"
tags="$(docker images "$IMAGE" --format '{{.Tag}}\t{{.CreatedSince}}\t{{.Size}}' | grep -v '^latest' || true)"
echo "되돌릴 수 있는 태그(최신순):"
[ -n "$tags" ] && echo "$tags" | sed 's/^/  /' || echo "  (없음)"
SCRIPT
}

prune_script() {
  cat <<'SCRIPT'
IMAGE="$1"; KEEP="$2"; CONTAINER="$3"
# 최신 KEEP 개만 남기고 정리한다.
# 지금 떠 있는 판의 태그는 반드시 남긴다 — latest 가 같은 이미지를 가리키고 있으면
# docker rmi 는 '마지막 참조'가 아니라서 그냥 untag 해 버린다. 그러면 무엇이 떠 있는지도,
# 어디로 되돌릴지도 알 수 없게 된다. (롤백 뒤에는 떠 있는 판이 최신 태그가 아닐 수 있다.)
RUNNING_IMAGE="$(docker inspect -f '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)"
RUNNING_TAG=""
case "$RUNNING_IMAGE" in "${IMAGE}:"*) RUNNING_TAG="${RUNNING_IMAGE#"${IMAGE}:"}" ;; esac

docker images "$IMAGE" --format '{{.Tag}}|{{.CreatedAt}}' \
  | grep -v '^latest|' \
  | sort -t'|' -k2 -r \
  | tail -n +$((KEEP + 1)) \
  | cut -d'|' -f1 \
  | while read -r old; do
      [ -n "$old" ] || continue
      [ "$old" = "$RUNNING_TAG" ] && continue
      docker rmi "${IMAGE}:${old}" >/dev/null 2>&1 && echo "  정리: ${IMAGE}:${old}" || true
    done
SCRIPT
}

if [ "$MODE" = list ]; then
  list_script | run_on_target "$IMAGE" "$CONTAINER"
  exit 0
fi

if [ "$MODE" = rollback ]; then
  echo "Rolling back to ${IMAGE}:${TAG}..."
  swap_script | run_on_target "$IMAGE" "$CONTAINER" "$TAG" "$PORT" "$NETWORK"
  echo "Rollback complete!"
  exit 0
fi

# ── 배포 ────────────────────────────────────────────────────────────────────
# 되돌릴 지점을 알아볼 수 있게 커밋 해시를 태그로 쓴다.
# git 이 없거나(아카이브에서 푼 경우) 하면 시각으로 대신한다.
if git rev-parse --git-dir >/dev/null 2>&1; then
  TAG="$(git rev-parse --short HEAD)"
  if ! git diff --quiet HEAD 2>/dev/null; then
    TAG="${TAG}-dirty"
    echo "경고: 커밋되지 않은 변경이 있습니다 → ${IMAGE}:${TAG} (같은 이름으로 덮어씁니다)" >&2
  fi
else
  TAG="$(date +%Y%m%d-%H%M%S)"
fi

echo "Building ${IMAGE}:${TAG}..."
docker build -t "${IMAGE}:${TAG}" -t "${IMAGE}:latest" .

if [ -z "$SSH_HOST" ]; then
  echo "Deploying on this host..."
  swap_script | run_on_target "$IMAGE" "$CONTAINER" "$TAG" "$PORT" "$NETWORK"
  prune_script | run_on_target "$IMAGE" "$KEEP" "$CONTAINER"
  echo "Deployment complete (local)!"
  exit 0
fi

# 저장소를 더럽히지 않도록 임시 디렉터리에 만들고, 끝나면 지운다
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT
ARCHIVE="${WORKDIR}/${IMAGE}-${TAG}.tar.gz"
# 원격에서는 홈 디렉터리 기준 상대 경로로 둔다 — '~' 를 넘기면 따옴표 안이라 펼쳐지지 않는다
REMOTE_ARCHIVE="${IMAGE}-${TAG}.tar.gz"

echo "Saving image..."
docker save "${IMAGE}:${TAG}" | gzip >"$ARCHIVE"

echo "Uploading to ${SSH_USER}@${SSH_HOST}..."
scp "$ARCHIVE" "${SSH_USER}@${SSH_HOST}:${REMOTE_ARCHIVE}"

echo "Deploying on remote host..."
ssh "${SSH_USER}@${SSH_HOST}" bash -s -- "$REMOTE_ARCHIVE" <<'SCRIPT'
set -e
docker load <"$1"
rm -f "$1"
SCRIPT
swap_script | run_on_target "$IMAGE" "$CONTAINER" "$TAG" "$PORT" "$NETWORK"
prune_script | run_on_target "$IMAGE" "$KEEP" "$CONTAINER"
# 빌드를 여기서 하므로 이 머신에도 태그가 쌓인다. 같은 기준으로 정리한다.
prune_script | bash -s -- "$IMAGE" "$KEEP" ""

echo "Deployment complete (remote)!"
echo "되돌리려면: ./deploy.sh --rollback <TAG> ${SSH_USER} ${SSH_HOST}"
