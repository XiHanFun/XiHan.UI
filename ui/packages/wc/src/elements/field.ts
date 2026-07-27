import type { Scope } from '@xihan-ui/core'
import type { FieldProps } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectField } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined：控件 id 的缺省（由 scope 派生）只在 connect 里有一份。
// Lit 自带的转换器会把缺席落成 null，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-field>` —— Light-DOM 行为宿主，无状态机：作者写 label/control/description/error-text
 * 角色节点，元素把 connectField 产出的 id 与 aria-* 打上去，`for` 与描述链由此自动对齐，
 * 表单页不必再逐个手写 aria-describedby。控件本身（input / select / textarea / 自定义控件）
 * 由作者渲染，宿主只把属性合并上去、不替他建节点。
 *
 * 每个实例自带一份 scope 派生 part id：同页多个 field 各出各的 id，
 * aria-describedby 才不会按 IDREF 串到别的实例的描述节点上。
 *
 * @customElement xh-field
 * @attr {boolean} invalid - 校验失败态：控件 aria-invalid=true，错误文案接入描述链并显出
 * @attr {boolean} required - 必填：控件 aria-required=true
 * @attr {boolean} disabled - 禁用标注，只落 data-disabled，不代作者写原生 disabled
 * @attr {string} control-id - 接管控件 id；缺省该属性即由 scope 派生。刻意不叫 id：
 *   宿主的 id 是 `<xh-field>` 自己的 DOM id，挪去当控件 id 会让两个节点撞同一个 id
 * @csspart root - 承载 data-disabled/data-invalid/data-required 的容器
 * @csspart label - 标题；`for` 恒写向控件，故须是原生 `<label>` 才点得动控件
 * @csspart control - 真正的输入控件本身（id 与 aria-* 落在这里，别标在外层包裹节点上）
 * @csspart description - 常驻说明文案，恒在控件的描述链里
 * @csspart error-text - 错误文案（role=alert）；非 invalid 时带 hidden 收起，节点不卸载
 */
export class XhFieldElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    invalid: { type: Boolean },
    required: { type: Boolean },
    disabled: { type: Boolean },
    controlId: { converter: STRING_CONVERTER, attribute: 'control-id' },
  }

  declare invalid?: boolean
  declare required?: boolean
  declare disabled?: boolean
  declare controlId?: string

  // 实例级、只建一次：id 一旦派生就写进了 for 与 aria-describedby，
  // 每帧重建 scope 会让这几条 IDREF 每帧换一次目标。
  private readonly fieldScope: Scope = createScope(null, createCounterIdGenerator())

  protected wire(): void {
    const props: FieldProps = {
      invalid: this.invalid,
      required: this.required,
      disabled: this.disabled,
      controlId: this.controlId,
    }
    const api = connectField(props, this.fieldScope, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    // 控件上只落 data-disabled：原生 disabled 归作者写在自己的控件上，
    // 宿主不代写、也不会擦掉（spreader 只回收本机器写过的属性）。
    put('control', api.getControlProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('error-text', api.getErrorTextProps() as Record<string, unknown>)

    // 错误文案常挂、靠 hidden 收起。随包的 field.css 特意没给 error-text 声明 display，
    // 但宿主不能指望作者装的正是这份样式：作者层任何一条 display 都会盖过 UA 的
    // [hidden]{display:none}，隐藏就此失效——只有内联 style.display 压得住。
    this.setPartHidden(this.getPart('error-text'), !api.invalid)
  }
}
