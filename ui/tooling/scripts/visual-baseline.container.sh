#!/usr/bin/env bash
# 像素基线在容器里的执行体，由 visual-baseline.mjs 启动，不单独调用。
#
# 挂载约定（宿主侧路径由 visual-baseline.mjs 决定）：
#   /host   宿主仓库，只读。容器一个字节都不往里写。
#   /cache  命名卷。pnpm store、corepack 缓存与容器自己的工作副本都放这里，跨次运行保留。
#   /out    基线目录，只在更新模式挂上来。
#   /diff   差异图落点，比对失败时把 actual / diff 拷出去。
#
# 工作副本不能直接用 /host：宿主的 node_modules 里是 win32-x64 的原生二进制，
# 在容器里跑不起来；而在只读挂载上装依赖也写不进去。所以源码同步进 /cache/work，
# 依赖在容器内独立安装并留在卷上，重复运行不必重装。
set -Eeuo pipefail

WORK=/cache/work
export PNPM_HOME=/cache/pnpm-home
export COREPACK_HOME=/cache/corepack
export PATH="$PNPM_HOME:$PATH"

STEP=启动

fail() {
  local code=$?
  echo ""
  echo "[visual-baseline] ✗ 挂在这一步：${STEP}（退出码 ${code}）"
  case "${STEP}" in
    系统依赖)
      echo "  apt-get 没装上 fonts-dejavu-core / rsync。容器出网被挡住时会挂在这里。"
      ;;
    字体核对)
      echo "  DejaVu Sans 这个名字解析不到，用例写死的字体族会静默回落成别的字体。"
      echo "  字体一换，每个字形的栅格化结果都变，四十张会整体判红。"
      echo "  装法：apt-get install -y fonts-dejavu-core && fc-cache -f"
      ;;
    同步源码)
      echo "  /host 读不到，或 /cache 卷写不进去。"
      ;;
    装依赖)
      echo "  pnpm install 失败。锁文件与 package.json 对不上时 --frozen-lockfile 会在这里停。"
      ;;
    构建)
      echo "  pnpm build 失败。浏览器态用例吃的是各包的 dist，构建不出来就没得跑。"
      ;;
    回拷)
      echo "  /out 或 /diff 写不进去。"
      ;;
  esac
  exit "${code}"
}
trap fail ERR

step() {
  STEP=$1
  echo ""
  echo "[visual-baseline] ── ${STEP}"
}

step 系统依赖
# 镜像默认的 sans-serif 是 WenQuanYi Zen Hei，装上 DejaVu 才与 CI 的字形一致；
# rsync 用来做增量同步，重复运行只搬动过的文件。
apt-get update -qq
apt-get install -y -qq --no-install-recommends fonts-dejavu-core rsync
fc-cache -f >/dev/null

step 字体核对
# 断言的是「DejaVu Sans 这个名字解析得到」，不是「默认 sans-serif 恰好是它」：
# 用例把字体族按名字写死在文档根上，泛族的解析结果并不参与渲染。
# 两者会分家——环境里多装几款字体（Noto Sans 等），泛族就轮不到 DejaVu 了，
# 而画面一个像素都不变。按泛族断言会在这类环境上白判失败。
MATCHED=$(fc-match 'DejaVu Sans')
echo "  fc-match 'DejaVu Sans' → ${MATCHED}"
echo "  （参考：默认 sans-serif → $(fc-match sans-serif)，不参与渲染）"
case "${MATCHED}" in
  DejaVuSans*) ;;
  *) false ;;
esac

step 同步源码
mkdir -p "$WORK" /cache/pnpm-store "$PNPM_HOME" "$COREPACK_HOME"
# node_modules 与 dist 排除在同步之外：容器要保留自己那一份 Linux 产物，
# 也不能让宿主的 win32 二进制被搬进来。.git 与 .turbo 同理，跑用例用不上。
rsync -a --delete \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.turbo \
  --exclude=dist \
  --exclude=.vitest-attachments \
  /host/ "$WORK/"

step 装依赖
cd "$WORK"
corepack enable pnpm
INSTALL_STARTED=$(date +%s)
# store 落在命名卷上，重复运行不再重新下载；与 $WORK 同卷，装包走硬链而不是复制。
pnpm install --frozen-lockfile --store-dir /cache/pnpm-store
echo "  装依赖耗时 $(($(date +%s) - INSTALL_STARTED)) 秒"

step 构建
pnpm build

step 跑用例
# 工作副本留在卷上跨次运行，上一轮的差异图也留着。不先清掉的话，这一轮全绿也会
# 把上一轮的红图原样拷出去，看图的人分不清是哪一轮的。
rm -rf "$WORK/packages/adapters/vue/.vitest-attachments"
VITEST_ARGS=(run --config vitest.browser.config.ts)
if [ -n "${XH_SPEC:-}" ]; then
  VITEST_ARGS+=("${XH_SPEC}")
fi
if [ "${XH_UPDATE:-0}" = "1" ]; then
  VITEST_ARGS+=(--update)
fi
echo "  vitest ${VITEST_ARGS[*]}"
# 比对失败也要把差异图拷出去，所以这一步的退出码先接住，回拷之后再抛。
# ERR 陷阱不受 set +e 管——bash 里两者是两套开关，只关 errexit 陷阱照样触发，
# 那样一失败就直接跳去 fail()，回拷永远轮不到。所以要连陷阱一起摘掉再装回来。
trap - ERR
set +e
pnpm --filter @xihan-ui/vue exec vitest "${VITEST_ARGS[@]}"
TEST_CODE=$?
set -e
trap fail ERR

step 回拷
SHOTS="$WORK/packages/adapters/vue/tests/browser/__screenshots__"
ATTACH="$WORK/packages/adapters/vue/.vitest-attachments"

if [ "${XH_UPDATE:-0}" = "1" ] && [ -d /out ]; then
  if [ -d "$SHOTS" ]; then
    rsync -a --delete "$SHOTS/" /out/
    echo "  基线已拷回：$(find /out -name '*.png' | wc -l) 张"
  else
    echo "  用例没有产出任何基线目录"
  fi
fi

if [ -d /diff ]; then
  # 上一轮的差异图必须先清掉，否则「这轮红了几张」会被历史残留搅浑。
  find /diff -mindepth 1 -delete
  if [ -d "$ATTACH" ]; then
    rsync -a "$ATTACH/" /diff/
    echo "  差异图已拷回：$(find /diff -name '*.png' | wc -l) 张"
  else
    echo "  没有差异图（没有比对失败的用例）"
  fi
fi

# 宿主是 Linux 时容器以 root 写出的文件会让宿主改不动，按调用方的 uid/gid 交还。
if [ -n "${HOST_UID:-}" ] && [ -n "${HOST_GID:-}" ]; then
  for dir in /out /diff; do
    if [ -d "$dir" ]; then
      chown -R "${HOST_UID}:${HOST_GID}" "$dir"
    fi
  done
fi

echo ""
if [ "$TEST_CODE" -ne 0 ]; then
  echo "[visual-baseline] ✗ 挂在这一步：跑用例（退出码 ${TEST_CODE}）"
  echo "  截图与基线对不上。差异图在 packages/adapters/vue/.vitest-attachments 下，"
  echo "  逐张看过、确认是有意的视觉改动之后，再用 --update 重出基线。"
else
  echo "[visual-baseline] ✓ 容器内全绿"
fi
exit "$TEST_CODE"
