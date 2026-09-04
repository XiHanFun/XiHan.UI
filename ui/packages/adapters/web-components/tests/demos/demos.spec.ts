// 文档站自定义元素版示例的批量验证台：每份 .html 在真实 Chromium 里挂一遍，逐条判据过。
//
// 判据五条：元素升级、作者写的角色节点全被发现、必需部件齐备、控制台零 error、脚本是 type="module"。
// 判据一与二只有在真浏览器里才成立——jsdom 不升级自定义元素。
//
// 只跑指定组件：置环境变量 XH_WC_DEMOS=select,dialog（由 tooling/scripts/check-wc-demos.mjs 传入）。
import type { DiagnosticRecord } from '@xihan-ui/kernel'
import * as headless from '@xihan-ui/headless'
import {
  onDiagnostic,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/kernel'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import { discoverParts } from '../../src/dom/parts'
// 皮肤与令牌一起加载：示例在文档站里就是带皮肤跑的，缺皮肤会引出与示例本身无关的诊断
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 由 vitest.demos.config.ts 的 define 注入，逗号分隔的组件目录名，空串表示全跑
declare const __XH_WC_DEMOS__: string

const DEMOS_PREFIX = '../../../../../../docs/.vitepress/demos/'

// 示例源码在构建期读进来，运行期不再碰文件系统
const RAW = import.meta.glob<string>('../../../../../../docs/.vitepress/demos/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** kebab → camelCase */
function camel(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

/** 组件的必需部件清单，取自 headless 的运行期元数据；没有元数据的标签返回 null。 */
function requiredParts(component: string): readonly string[] | null {
  const meta = (headless as Record<string, unknown>)[`${camel(component)}Meta`] as
    | { requiredParts?: readonly string[] }
    | undefined
  return meta?.requiredParts ?? null
}

interface Demo {
  /** 组件目录名 */
  readonly component: string
  /** 形如 select/01-basic.html，用作用例名 */
  readonly id: string
  readonly html: string
}

const filter = new Set(__XH_WC_DEMOS__.split(',').map(s => s.trim()).filter(Boolean))

const demos: Demo[] = Object.entries(RAW)
  .map(([path, html]) => {
    const rel = path.slice(DEMOS_PREFIX.length)
    return { component: rel.slice(0, rel.indexOf('/')), id: rel, html }
  })
  .filter(demo => filter.size === 0 || filter.has(demo.component))
  .sort((a, b) => a.id.localeCompare(b.id))

// innerHTML 收下的 <script> 不会执行，逐个重建成新节点才跑得起来（与文档站同一做法）
function reviveScripts(host: HTMLElement): void {
  for (const stale of Array.from(host.querySelectorAll('script'))) {
    const script = document.createElement('script')
    for (const attr of Array.from(stale.attributes)) script.setAttribute(attr.name, attr.value)
    script.textContent = stale.textContent
    stale.replaceWith(script)
  }
}

/** 刷到 DOM 不再动为止：宿主接线会排新一轮，示例脚本也可能再改 DOM。 */
const MAX_SETTLE_ROUNDS = 10

async function settle(host: HTMLElement): Promise<void> {
  const observer = new MutationObserver(() => {})
  observer.observe(document.body, { attributes: true, childList: true, subtree: true, characterData: true })
  try {
    for (let round = 0; round < MAX_SETTLE_ROUNDS; round++) {
      // 让出一个宏任务：内联 module 脚本是异步执行的，微任务这一拍还等不到它
      await new Promise(resolve => setTimeout(resolve, 0))
      for (const el of Array.from(host.querySelectorAll('*'))) {
        const pending = (el as { updateComplete?: Promise<unknown> }).updateComplete
        if (pending)
          await pending
      }
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
      if (observer.takeRecords().length === 0)
        return
    }
  }
  finally {
    observer.disconnect()
  }
}

/** 描述一个节点：标签 + 作者写的角色名，报错时据它回文件里找。 */
function describeNode(el: Element): string {
  const part = el.getAttribute('data-xh-part')
  return `<${el.tagName.toLowerCase()}${part ? ` data-xh-part="${part}"` : ''}>`
}

const consoleErrors: string[] = []
const pageErrors: string[] = []
const diagnostics: DiagnosticRecord[] = []

let stopDiagnostics: (() => void) | undefined
let stage: HTMLElement | null = null
const nativeError = console.error

function onPageError(event: ErrorEvent): void {
  pageErrors.push(event.message || String(event.error))
}

function onRejection(event: PromiseRejectionEvent): void {
  pageErrors.push(`未处理的 Promise 拒绝：${String(event.reason)}`)
}

beforeAll(() => {
  defineXhElements()
  // 诊断全量放行且不去重：示例逐份跑，同一条问题在哪一份出现都要各报一次。
  // 内建 console 输出关掉，改由本用例按「哪份示例·哪条码·哪句话」一行一条地印
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  setDiagnosticsConsoleOutput(false)
  stopDiagnostics = onDiagnostic(record => diagnostics.push(record))
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(' '))
    nativeError(...args)
  }
  window.addEventListener('error', onPageError)
  window.addEventListener('unhandledrejection', onRejection)
})

afterEach(async () => {
  // 先摘容器再刷一拍：宿主的断开清理排在微任务里，不等它跑完就进下一份，退场逻辑会算到下一份头上
  stage?.remove()
  stage = null
  await new Promise(resolve => setTimeout(resolve, 0))
  consoleErrors.length = 0
  pageErrors.length = 0
  diagnostics.length = 0
})

afterAll(() => {
  stopDiagnostics?.()
  console.error = nativeError
  window.removeEventListener('error', onPageError)
  window.removeEventListener('unhandledrejection', onRejection)
})

describe('自定义元素版示例', () => {
  if (demos.length === 0) {
    it('没有可跑的示例', () => {
      expect.fail(`筛选 [${[...filter].join(', ')}] 之后一份 .html 示例都不剩`)
    })
    return
  }

  for (const demo of demos) {
    it(demo.id, async () => {
      const problems: string[] = []

      // 判据五：脚本必须 type="module"。示例会被反复挂载，顶层常量在经典脚本里第二次就撞名
      for (const [index, matched] of [...demo.html.matchAll(/<script\b([^>]*)>/gi)].entries()) {
        if (!/\btype\s*=\s*["']module["']/i.test(matched[1] ?? ''))
          problems.push(`第 ${index + 1} 个 <script> 没写 type="module"`)
      }

      stage = document.createElement('div')
      document.body.append(stage)
      stage.innerHTML = demo.html
      reviveScripts(stage)
      await settle(stage)

      const hosts = Array.from(stage.querySelectorAll('*')).filter(el =>
        el.tagName.toLowerCase().startsWith('xh-'),
      ) as HTMLElement[]

      if (hosts.length === 0)
        problems.push('整份示例里没有一个 xh-* 标签')

      for (const host of hosts) {
        const tag = host.tagName.toLowerCase()
        const component = tag.slice('xh-'.length)

        // 判据一：元素升级了。没注册的标签在页面上只是一个惰性 <unknown-element>
        const ctor = customElements.get(tag)
        if (!ctor) {
          problems.push(`<${tag}> 没有注册，defineXhElements 里查无此标签`)
          continue
        }
        if (!(host instanceof ctor)) {
          problems.push(`<${tag}> 没有升级成自定义元素`)
          continue
        }

        // 判据三：必需部件齐备。清单取自 headless 的运行期元数据
        const owned = discoverParts(host)
        for (const part of requiredParts(component) ?? []) {
          if (!owned.has(part))
            problems.push(`<${tag}> 缺必需部件 data-xh-part="${part}"`)
        }
      }

      // 判据二：作者写的每个角色节点都被发现并接线。包在 xh-* 子元素里的触发器、拼错的部件名都栽在这
      for (const el of Array.from(stage.querySelectorAll('[data-xh-part]'))) {
        const authored = el.getAttribute('data-xh-part')!
        const wired = el.getAttribute('data-part')
        if (wired === null)
          problems.push(`${describeNode(el)} 没被接线：拿不到 data-part，检查部件名是否拼错、是否被包进了别的 xh-* 元素里`)
        else if (wired !== authored)
          problems.push(`${describeNode(el)} 接成了 data-part="${wired}"`)
        else if (!el.hasAttribute('data-scope'))
          problems.push(`${describeNode(el)} 拿到了 data-part 却没有 data-scope`)
      }

      // 判据四：控制台零 error，未捕获异常与 error 级诊断同论
      for (const line of consoleErrors) problems.push(`console.error：${line}`)
      for (const line of pageErrors) problems.push(`未捕获异常：${line}`)
      for (const record of diagnostics) {
        if (record.level === 'error')
          problems.push(`诊断 ${record.code}：${record.message}`)
      }

      // warn 只陈述不判罚，但要让人看见
      for (const record of diagnostics) {
        if (record.level === 'warn')
          console.warn(`[${demo.id}] 诊断 ${record.code}：${record.message}`)
      }

      if (problems.length > 0)
        expect.fail(`${demo.id}\n${problems.map(p => `  · ${p}`).join('\n')}`)
    })
  }
})
