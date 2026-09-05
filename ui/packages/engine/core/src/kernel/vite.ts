// 启动横幅：打在开发者跑项目的那个终端里。
//
// 浏览器里的代码够不着开发服务器进程的标准输出，只有跑在 Node 里的构建插件够得着，
// 所以这一份从 `@xihan-ui/core/vite` 这条子入口取，不从 index 再导出。
//
// 标志与寄语也住在这里而不是 metadata.ts：那个对象会被浏览器产物带走，
// 发到每个访问网站的人手上；横幅是给开发者看的，不该走那条路。
// 浏览器侧的摘要默认不打，开关见 metadata.ts 的 setMetadataAutoPrint。

import { XIHAN_UI_LOGO, XIHAN_UI_METADATA, XIHAN_UI_SEND_WORD } from './metadata'

/**
 * 只用到 Vite 的这几处形状，因此不从 vite 取类型：
 * 取了就得把 vite 列进依赖，而这个包一个运行时第三方依赖都没有。
 */
interface ViteLoggerLike {
  info: (msg: string, options?: { clear?: boolean, timestamp?: boolean }) => void
}

interface ViteDevServerLike {
  config?: { logger?: ViteLoggerLike }
  printUrls?: () => void
  httpServer?: { once: (event: string, listener: () => void) => void } | null
}

export interface XiHanUiBannerPlugin {
  name: string
  configureServer: (server: ViteDevServerLike) => void
}

export interface XiHanUiBannerOptions {
  /** 打不打，默认打。 */
  enabled?: boolean
  /** 上不上色，默认在支持的终端上色。 */
  color?: boolean
}

/** 进程信息按结构取：这个包不依赖 @types/node。 */
interface ProcessLike {
  stdout?: { isTTY?: boolean }
  env?: Record<string, string | undefined>
  argv?: string[]
  platform?: string
}

function getProcess(): ProcessLike | undefined {
  // 不写 import process from 'node:process'：库包的 tsconfig 是 "types": []，
  // 一个环境类型包都不引，那句在这里类型检查过不去。取不到就当没有，退回不上色
  // eslint-disable-next-line node/prefer-global/process
  return (globalThis as { process?: ProcessLike }).process
}

/**
 * 判据与 picocolors 逐条对齐——Vite 自己的输出就是用它上色的，
 * 照它走横幅才与周围那几行同进同退。
 *
 * 只看 isTTY 是不够的：跑在 turbo 底下时 stdout 是管道、isTTY 为假，
 * 而 Vite 的地址那几行照样是彩色的，横幅跟着变成唯一没颜色的一段。
 * 那一条来自 platform === 'win32'：Windows 上无条件上色。
 */
function supportsColor(): boolean {
  const proc = getProcess()
  if (!proc)
    return false
  const env = proc.env ?? {}
  const argv = proc.argv ?? []
  if (env.NO_COLOR || argv.includes('--no-color'))
    return false
  if (env.FORCE_COLOR || argv.includes('--color'))
    return true
  if (proc.platform === 'win32' || env.CI)
    return true
  return proc.stdout?.isTTY === true && env.TERM !== 'dumb'
}

/** 收色，回到终端默认前景色。 */
const RESET = '\u001B[0m'

/**
 * HSV 转 RGB，色相 0-360、饱和度与明度 0-1。
 * 与 Framework 侧 ConsoleColorWriter.HsvToRgb 同一套算术。
 */
function hsvToRgb(hue: number, saturation: number, value: number): [number, number, number] {
  const h = hue / 60
  const c = value * saturation
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = value - c
  const sextant: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  const [r, g, b] = sextant[Math.min(5, Math.trunc(h))]!
  return [Math.trunc((r + m) * 255), Math.trunc((g + m) * 255), Math.trunc((b + m) * 255)]
}

/**
 * 逐字符横向彩虹，与 Framework 侧 LogHelper.Rainbow 同一套：
 * 进度取字符在行内的下标除以最长行的长度，色相走 0-300 度——到 300 就停，
 * 再往前会绕回红色、首尾撞色。空格不上色，标志的镂空处不会被染上底噪。
 */
function rainbow(line: string, width: number, color: boolean): string {
  if (!color)
    return line
  let out = ''
  let painted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!
    if (char === ' ') {
      // 收掉当前颜色再写空格：留着它,行尾的背景色会拖出一条尾巴
      if (painted) {
        out += RESET
        painted = false
      }
      out += char
      continue
    }
    const [r, g, b] = hsvToRgb((i / Math.max(1, width - 1)) * 300, 1, 1)
    out += `\u001B[38;2;${r};${g};${b}m${char}`
    painted = true
  }
  return painted ? out + RESET : out
}

/** 整段逐行上色，进度基准取最长的那一行，与 Framework 一致。 */
function rainbowBlock(text: string, color: boolean): string[] {
  const lines = text.split('\n')
  const width = lines.reduce((max, line) => Math.max(max, line.length), 0)
  return lines.map(line => rainbow(line, width, color))
}

function dim(text: string, color: boolean): string {
  return color ? `\u001B[2m${text}${RESET}` : text
}

/**
 * 横幅文本。不复用 getMetadataSummary()：那一份末尾报的是运行时宿主，
 * 而宿主要等适配器在浏览器里启动才登记得上，在终端里恒是「未登记」。
 */
export function getXiHanUiBanner(options: XiHanUiBannerOptions = {}): string {
  const color = options.color ?? supportsColor()
  const m = XIHAN_UI_METADATA
  return [
    '',
    ...rainbowBlock(XIHAN_UI_LOGO, color),
    '',
    `${m.name} ${m.displayName} v${m.version}`,
    dim(m.description, color),
    dim(XIHAN_UI_SEND_WORD, color),
    '',
  ].join('\n')
}

/**
 * 把启动横幅打到当前进程的标准输出上。不认识 Vite，任何 Node 脚本都能调。
 *
 * 在 `vite.config.ts` 顶层直接调会被 Vite 的 clearScreen 清掉，
 * 那种场合用下面的 xihanUiBanner()，它挑好了时机。
 */
export function printXiHanUiBanner(options: XiHanUiBannerOptions = {}): void {
  if (options.enabled === false)
    return
  // eslint-disable-next-line no-console
  console.info(getXiHanUiBanner(options))
}

/**
 * 开发服务器启动时在终端打一次启动横幅。
 *
 * ```ts
 * import { xihanUiBanner } from '@xihan-ui/core/vite'
 *
 * export default defineConfig({ plugins: [xihanUiBanner()] })
 * ```
 *
 * 只在 `vite serve` 起作用——`configureServer` 构建时根本不调，
 * 因此不必再判 mode（mode 是任意字符串，判它会漏掉 `--mode staging` 这类）。
 */
export function xihanUiBanner(options: XiHanUiBannerOptions = {}): XiHanUiBannerPlugin {
  return {
    name: 'xihan-ui:banner',
    configureServer(server) {
      if (options.enabled === false)
        return

      const write = (): void => {
        const text = getXiHanUiBanner(options)
        // 走 Vite 自己的日志通道，--silent 与 logLevel 才管得住它；
        // clear: false 是要紧的，默认那一档会把上面的输出整屏清掉
        const logger = server.config?.logger
        if (logger)
          logger.info(text, { clear: false, timestamp: false })
        else
          printXiHanUiBanner(options)
      }

      // 排在 Vite 打完本地地址之后。Vite 打那一段时会清屏，
      // 挂 httpServer 的 listening 仍然早于它，横幅会被冲掉
      const printUrls = server.printUrls
      if (typeof printUrls === 'function') {
        server.printUrls = () => {
          printUrls.call(server)
          write()
        }
        return
      }
      // 中间件模式没有这一段，退回按端口就绪来打
      if (server.httpServer)
        server.httpServer.once('listening', write)
      else
        write()
    },
  }
}
