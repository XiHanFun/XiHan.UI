// 启动横幅：打在开发者跑项目的那个终端里。
//
// 浏览器里的代码够不着开发服务器进程的标准输出，只有跑在 Node 里的构建插件够得着，
// 所以这一份从 `@xihan-ui/kernel/vite` 这条子入口取，不从 index 再导出。
//
// 标志与寄语也住在这里而不是 metadata.ts：那个对象会被浏览器产物带走，
// 发到每个访问网站的人手上；横幅是给开发者看的，不该走那条路。
// 浏览器侧的摘要默认不打，开关见 metadata.ts 的 setMetadataAutoPrint。

import { XIHAN_UI_METADATA } from './metadata'

/** 曦寒标志。 */
const LOGO = [
  '   _  __ ______  _____    _   __',
  '  | |/ //  _/ / / /   |  / | / /',
  '  |   / / // /_/ / /| | /  |/ /',
  ' /   |_/ // __  / ___ |/ /|  /',
  '/_/|_/___/_/ /_/_/  |_/_/ |_/',
]

/** 曦寒寄语。 */
const SEND_WORD = [
  '碧落降恩承淑颜，共挚崎缘挽曦寒。',
  '迁般故事终成忆，谨此葳蕤换思短。',
  '              —— 致她',
]

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
}

function getProcess(): ProcessLike | undefined {
  // 不写 import process from 'node:process'：库包的 tsconfig 是 "types": []，
  // 一个环境类型包都不引，那句在这里类型检查过不去。取不到就当没有，退回不上色
  // eslint-disable-next-line node/prefer-global/process
  return (globalThis as { process?: ProcessLike }).process
}

/** NO_COLOR 是跨工具的约定；非 TTY 也不上色，输出重定向到文件时全是转义序列。 */
function supportsColor(): boolean {
  const proc = getProcess()
  if (!proc || proc.env?.NO_COLOR)
    return false
  return proc.stdout?.isTTY === true
}

/** 标志逐行渐变，与 Framework 侧 LogHelper.Rainbow 打出来的观感一致。 */
const GRADIENT: readonly (readonly [number, number, number])[] = [
  [167, 139, 250],
  [139, 149, 250],
  [110, 168, 249],
  [96, 186, 240],
  [94, 205, 224],
]

function paint(line: string, index: number, color: boolean): string {
  if (!color)
    return line
  const [r, g, b] = GRADIENT[index % GRADIENT.length]!
  return `\u001B[38;2;${r};${g};${b}m${line}\u001B[0m`
}

function dim(text: string, color: boolean): string {
  return color ? `\u001B[2m${text}\u001B[0m` : text
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
    ...LOGO.map((line, i) => paint(line, i, color)),
    '',
    `${m.name} ${m.displayName} v${m.version}`,
    dim(m.description, color),
    dim(SEND_WORD.join('\n'), color),
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
 * import { xihanUiBanner } from '@xihan-ui/kernel/vite'
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
