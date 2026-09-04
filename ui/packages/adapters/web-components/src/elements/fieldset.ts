import type { FieldsetProps, FieldsetTranslations } from '@xihan-ui/headless'
import type { Scope } from '@xihan-ui/kernel'
import { connectFieldset, fieldsetAnatomy, fieldsetMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope, DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，="false" 为假，其余在场即真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-fieldset>` —— Light-DOM 行为宿主，无状态机，把 connectFieldset 产出的属性打到
 * root/legend/description/error-text 角色节点上：说明与错误文案的 id 自动接进 root 的描述链。
 *
 * root 必须是原生 `<fieldset>`、legend 必须是原生 `<legend>` 且写成 root 的首个子节点——
 * 整组禁用连坐组内控件与"legend 即组名"都是浏览器给的，写成 div 两样都静默失效。
 *
 * 每个实例自带一份 scope 派生 part id，同页多个字段集各出各的 id。
 *
 * @customElement xh-fieldset
 * @attr {boolean} disabled - 整组禁用：root 落原生 disabled，组内表单控件一并停掉
 * @attr {boolean} invalid - 校验失败态：错误文案接入描述链并显出
 * @attr {boolean} required - 必填标记，只落 data-required 供皮肤给组标题加星号
 * @csspart root - 原生 `<fieldset>`，承载原生 disabled 与 data-disabled/data-invalid/data-required
 * @csspart legend - 原生 `<legend>`，这一组的名字；须是 root 的首个子节点
 * @csspart description - 常驻说明文案，恒在 root 的描述链里
 * @csspart error-text - 错误文案（role=status，排队播报不打断）；非 invalid 时带 hidden 收起，节点不卸载
 */
export class XhFieldsetElement extends XhElement {
  // 两个部件的标签名一旦写错，禁用连坐与组名都没了，却不会报任何错，故登记进契约校验
  static override partContract = {
    anatomy: fieldsetAnatomy,
    meta: fieldsetMeta,
    tags: { root: ['fieldset'], legend: ['legend'] },
  }

  // 三个开关走三态转换器：disabled="false" 读成假，与 Vue 侧 :disabled="false" 同解。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    disabled: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare disabled?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare translations?: Partial<FieldsetTranslations>

  // 实例级 scope 只建一次，避免派生出的 id 每帧变化
  private readonly fieldsetScope: Scope = createScope(null, createCounterIdGenerator())

  protected wire(): void {
    const props: FieldsetProps = {
      disabled: this.disabled,
      invalid: this.invalid,
      required: this.required,
      translations: this.translations,
    }
    const api = connectFieldset(this.configured('fieldset', props), this.fieldsetScope, wcNormalize)

    this.#checkLegendPosition()

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('legend', api.getLegendProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('error-text', api.getErrorTextProps() as Record<string, unknown>)

    // 错误文案常挂，非 invalid 时用内联 display 收起（作者层的 display 会盖过 UA 的 [hidden] 规则）
    this.setPartHidden(this.getPart('error-text'), !api.invalid)
  }

  /**
   * legend 不是 fieldset 首个子节点时报一条诊断。标签名由 partContract 校，位置它校不到，
   * 而位置错了组名与"首个 legend 内的控件不被禁用连坐"一起静默失效，控制台不会有任何动静。
   */
  #checkLegendPosition(): void {
    const root = this.getPart('root')
    const legend = this.getPart('legend')
    if (!root || !legend || root.firstElementChild === legend)
      return
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      message: 'legend 不是 fieldset 的首个子节点：浏览器不把它当这一组的名字，legend 内的控件也会被整组禁用连坐',
      scope: fieldsetAnatomy.name,
      part: 'legend',
      node: legend,
    })
  }
}
