import { connectCodeBlock } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-code-block>` —— Light-DOM 行为宿主，无状态机：wire 时算出 connectCodeBlock 的产出，
 * 打到四类角色节点上。显示的代码文本由作者写在 code 角色节点里，元素不改其子节点。
 * 复制按钮由 `<xh-clipboard>` 组合提供。
 *
 * @customElement xh-code-block
 * @attr {string} code - 代码原文，只用于数行数预撑高度
 * @attr {string} code-lang - 围栏语言标注，空白时按 plaintext 处理
 * @attr {boolean} complete - 代码块是否已闭合
 * @csspart root - 外壳，承载 data-lang / data-complete
 * @csspart lang-label - 语言角标，纯装饰且对读屏隐藏
 * @csspart pre - 横向滚动容器；tabindex=0，最小高度按行数写进内联样式
 * @csspart code - 代码文本本身，承载 data-lang
 */
export class XhCodeBlockElement extends XhElement {
  // 属性名用 code-lang，避开 HTML 全局属性 lang 与 HTMLElement 原生 lang 访问器。
  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字。
  static override properties = {
    code: { converter: STRING_CONVERTER },
    codeLang: { converter: STRING_CONVERTER, attribute: 'code-lang' },
    complete: { converter: BOOLEAN_CONVERTER },
  }

  declare code?: string
  declare codeLang?: string
  declare complete?: boolean

  protected wire(): void {
    const api = connectCodeBlock({ code: this.code ?? '', lang: this.codeLang, complete: this.complete }, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('lang-label', api.getLangLabelProps() as Record<string, unknown>)
    put('pre', api.getPreProps() as Record<string, unknown>)
    put('code', api.getCodeProps() as Record<string, unknown>)
  }
}
