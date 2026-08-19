// 废弃登记与探测:四种没有 IDE 提示的介质在 dev 里通过诊断通道发 warn。
//
// 版本政策(docs/guide/versioning.md「废弃流程」)承诺:JS 导出走 @deprecated,而
// CSS 自定义属性 / data-* 选择器 / @layer 名 / 自定义元素 attribute 这四种介质
// 没有 IDE 提示,只能靠更新日志告知。这个模块补上机器检查:维护者把废弃名登记进
// 登记表,dev 里适配器自动启动扫描,消费方的旧用法经诊断通道变成一条 warn。
//
// 五种介质与探测面:
//   css-var   样式表(CSSOM / <style> 文本)里出现 --xh-xxx
//   layer     样式表里出现 @layer 层名
//   selector  样式表里出现 data-* 选择器片段,如 [data-part='thumb']
//   attribute DOM 里 xh-* 元素上挂着废弃 attribute
//   part      作者写的 data-xh-part 角色名——不在这里扫,由 web-components 适配器的
//             部件契约校验(part-contract)带上下文投递,登记表只提供查表
//
// 登记表默认为空:空表时扫描器直接返回,零开销。deprecationEntries 在启动时快照,
// 所以注册要发生在扫描启动之前(适配器都是模块加载期注册、dev 首次使用时启动)。
import type { Cleanup } from '../types'
import { reportDiagnostic } from './channel'
import { DIAGNOSTIC_CODES } from './codes'

export type DeprecationMedium = 'css-var' | 'layer' | 'selector' | 'attribute' | 'part'

export interface DeprecatedEntry {
  readonly medium: DeprecationMedium
  /** 匹配串:css-var 为 --xh-xxx,layer 为层名,selector 为选择器片段,attribute 为属性名,part 为 part 名。 */
  readonly match: string
  /** 面向开发者的迁移说明,原样进诊断 message。 */
  readonly message: string
  /** 换成什么(没有替代就省略)。 */
  readonly replaceWith?: string
  /** 计划移除的版本,纯提示。 */
  readonly until?: string
}

export interface DeprecationScanOptions {
  /** 观察哪棵树,默认整篇文档。 */
  root?: ParentNode & Node
  /** 是否扫样式表(跨域样式表读不到,静默跳过)。默认 true。 */
  stylesheets?: boolean
}

const registry: DeprecatedEntry[] = []

/** 登记一条废弃名。重复登记同一条由通道去重兜住,不额外判重。 */
export function registerDeprecation(entry: DeprecatedEntry): void {
  registry.push(entry)
}

export function deprecationEntries(): readonly DeprecatedEntry[] {
  return registry
}

export function findDeprecatedPart(part: string): DeprecatedEntry | undefined {
  return registry.find(entry => entry.medium === 'part' && entry.match === part)
}

/** 清空登记表,测试之间用。 */
export function resetDeprecations(): void {
  registry.length = 0
}

const CODE_BY_MEDIUM: Record<DeprecationMedium, string> = {
  'css-var': DIAGNOSTIC_CODES.deprecatedCssVar,
  'layer': DIAGNOSTIC_CODES.deprecatedLayer,
  'selector': DIAGNOSTIC_CODES.deprecatedSelector,
  'attribute': DIAGNOSTIC_CODES.deprecatedAttribute,
  'part': DIAGNOSTIC_CODES.deprecatedPart,
}

function detailOf(entry: DeprecatedEntry, extra: Readonly<Record<string, unknown>> = {}): Record<string, unknown> {
  return { match: entry.match, replaceWith: entry.replaceWith ?? null, until: entry.until ?? null, ...extra }
}

/** 样式表里的三个介质:判定落在文本包含关系上。 */
const CSS_TEXT_MEDIA = new Set<DeprecationMedium>(['css-var', 'layer', 'selector'])

function reportFromText(entry: DeprecatedEntry, source: string, node?: Element): void {
  reportDiagnostic({
    code: CODE_BY_MEDIUM[entry.medium],
    level: 'warn',
    message: entry.message,
    node,
    detail: detailOf(entry, { source }),
  })
}

/**
 * 启动废弃探测,返回停止函数。只该在开发模式下调用;登记表为空时直接返回零开销的清理函数。
 *
 * DOM 侧扫一遍已有节点,再用 MutationObserver 接住后续进来的;<style> 文本随节点一起看,
 * 跨域 <link> 样式表走 CSSOM 只扫一遍,之后动态注入的样式表不在观察范围内。
 */
export function startDeprecationScan(options: DeprecationScanOptions = {}): Cleanup {
  if (typeof document === 'undefined')
    return () => undefined
  const entries = deprecationEntries()
  if (entries.length === 0)
    return () => undefined

  const root = options.root ?? document
  const textEntries = entries.filter(entry => CSS_TEXT_MEDIA.has(entry.medium))
  const attrEntries = entries.filter(entry => entry.medium === 'attribute')

  const scanStyleNode = (el: Element): void => {
    const text = el.textContent ?? ''
    if (text === '')
      return
    for (const entry of textEntries) {
      if (text.includes(entry.match))
        reportFromText(entry, '<style>', el)
    }
  }

  // 'xh-*' 不是合法选择器（jsdom 直接查不到），走通用属性选择器 + tagName 前缀过滤，
  // 只认库元素上的废弃 attribute，业务元素同名属性不误报
  const reportAttr = (el: Element, entry: DeprecatedEntry): void => {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.deprecatedAttribute,
      level: 'warn',
      message: entry.message,
      scope: el.tagName.toLowerCase().replace(/^xh-/, ''),
      node: el,
      detail: detailOf(entry),
    })
  }

  const scanAttributes = (container: ParentNode): void => {
    // 容器自身可能就是一个刚进来的 xh-* 元素（querySelectorAll 不含自己）
    if (container instanceof Element && container.tagName.toLowerCase().startsWith('xh-')) {
      for (const entry of attrEntries) {
        if (container.hasAttribute(entry.match))
          reportAttr(container, entry)
      }
    }
    for (const entry of attrEntries) {
      for (const el of container.querySelectorAll(`[${entry.match}]`)) {
        if (el.tagName.toLowerCase().startsWith('xh-'))
          reportAttr(el, entry)
      }
    }
  }

  const walkRules = (rules: CSSRuleList, sheet: CSSStyleSheet): void => {
    for (const rule of Array.from(rules)) {
      let text = ''
      try {
        text = rule.cssText ?? ''
      }
      catch {
        text = ''
      }
      if (text !== '') {
        for (const entry of textEntries) {
          if (text.includes(entry.match))
            reportFromText(entry, sheet.href ?? '<link>')
        }
      }
      // 媒体查询、层块等分组规则往下递归
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) {
        try {
          walkRules(nested, sheet)
        }
        catch {}
      }
    }
  }

  const scanStyleSheets = (): void => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules
      try {
        rules = sheet.cssRules
      }
      catch {
        // 跨域样式表读不到,静默跳过
        continue
      }
      walkRules(rules, sheet)
    }
  }

  for (const style of root.querySelectorAll('style')) scanStyleNode(style)
  scanAttributes(root)
  if (options.stylesheets !== false)
    scanStyleSheets()

  // 构造器从被观测节点自己的文档取：跨 iframe 时全局的那个来自另一个 window，
  // 拿它去观测别的文档里的节点，回调一次都不会来。
  // root 可能就是 Document（它自己的 ownerDocument 是 null），所以两种都认
  const doc = root.nodeType === 9 ? (root as unknown as Document) : root.ownerDocument
  const view = doc?.defaultView
  if (typeof view?.MutationObserver !== 'function')
    return () => undefined

  const observer = new view.MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (!(node instanceof Element))
          continue
        if (node.tagName === 'STYLE')
          scanStyleNode(node)
        scanAttributes(node)
      }
    }
  })
  observer.observe(root, { childList: true, subtree: true })
  return () => observer.disconnect()
}
