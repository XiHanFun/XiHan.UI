import { connectCodeBlock } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在 connect 里。
// Lit 自带的转换器会把缺席落成 null，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（还没吐完，按未闭合处理）、="false"=false、其余=true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-code-block>` —— Light-DOM 行为宿主，无状态机：代码块没有任何自有状态，
 * 语言、行数、闭合与否全由属性逐帧递进来，wire 时算 connectCodeBlock 打到四类角色节点上。
 *
 * `code` 属性只用来数行数、把 pre 的最小高度先撑住：流式吐字期间代码块一行行长出来，
 * 不预撑的话下方内容会被一行行顶着往下跑。真正显示的代码文本由作者写在 code 角色节点里，
 * 元素不去改它的子节点——这里的属性铺设与文本渲染是两件事。
 *
 * 没有复制按钮：复制是一段带"已复制"反馈的状态机，本仓已有 headless clipboard，
 * 要复制按钮就把 `<xh-clipboard>` 组合进来，别在这儿再造一套。
 *
 * @customElement xh-code-block
 * @attr {string} code - 代码原文；只用于数行数预撑高度，缺省即不预撑（不影响显示）
 * @attr {string} code-lang - 围栏语言标注；空白、半截或不认识一律按 plaintext 处理
 * @attr {boolean} complete - 代码块是否已闭合；未闭合时皮肤可据此显示还在吐字
 * @csspart root - 外壳（承载 data-lang / data-complete）
 * @csspart lang-label - 语言角标；纯装饰，对读屏隐藏
 * @csspart pre - 真正 overflow-x:auto 的那层；tabindex=0 让键盘用户滚得动，最小高度按行数写进内联样式
 * @csspart code - 代码文本本身（承载 data-lang）
 */
export class XhCodeBlockElement extends XhElement {
  // 属性名叫 code-lang 而不是 lang：lang 是 HTML 全局属性，写上去等于声明整块内容的自然语言，
  // `lang="cs"`（C#）会让读屏按捷克语把整段代码念一遍。字段名 codeLang 顺带避开了
  // HTMLElement 原生 lang 访问器的类型冲突。属性仍进 observedAttributes，
  // 流式期间语言标注从半截补全（```ty → ```typescript）照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    code: { converter: STRING_CONVERTER },
    codeLang: { converter: STRING_CONVERTER, attribute: 'code-lang' },
    complete: { converter: BOOLEAN_CONVERTER },
  }

  declare code?: string
  declare codeLang?: string
  declare complete?: boolean

  protected wire(): void {
    // 读声明好的响应式属性，不回读 DOM 特性：框架绑定走的是 property 这条路，
    // 回读特性会让它空转。code 缺席按空串算——数出来是 1 行，等于不预撑高度，
    // 而 min-block-size 本就只是下界，显示的代码该多高还是多高
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
