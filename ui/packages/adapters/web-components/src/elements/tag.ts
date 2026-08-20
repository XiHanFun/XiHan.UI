import type { TagOpenChangeDetails, TagSchema, TagVariant } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectTag, tagAnatomy, tagMachine, tagMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 default-open 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tag>` —— Light-DOM 行为宿主：作者写 root、label、close-trigger 角色节点，
 * 元素跑 tag 机器并把 connect 产出打上去。关闭钮须是原生 `<button>`
 * （Enter/Space 的激活由平台负责），收起时用内联 style.display 隐藏 root。
 *
 * @customElement xh-tag
 * @attr {'solid'|'subtle'|'outline'} variant - 形态，决定颜色怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定用哪族颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} closable - 是否给出关闭钮，缺省为假；为假时该钮同时被禁用与收起
 * @attr {boolean} disabled - 标签禁用，关闭钮留在原地但按不动
 * @attr {boolean} open - 受控显隐；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始显隐，缺省为显示
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 标签根容器
 * @csspart label - 标签文字
 * @csspart close-trigger - 关闭钮，须是原生 `<button>`
 */
export class XhTagElement extends XhElement {
  static override partContract = { anatomy: tagAnatomy, meta: tagMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    closable: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    // 文案是对象，只能走 property
    translations: { attribute: false },
  }

  declare variant?: TagVariant
  declare tone?: Tone
  declare size?: Size
  declare closable?: boolean
  declare disabled?: boolean
  declare open?: boolean
  declare defaultOpen?: boolean
  declare translations?: TagSchema['props']['translations']

  private readonly notify = (details: TagOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  // tag 机器无副作用：不需要 config/layer/refs，controller 只带 props
  private readonly ctrl = new MachineController<TagSchema>(this, tagMachine, () => this.machineProps())

  private machineProps(): Partial<TagSchema['props']> {
    return {
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      closable: this.closable,
      disabled: this.disabled,
      open: this.open,
      defaultOpen: this.defaultOpen,
      translations: this.translations,
      onOpenChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectTag(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // 收起时用内联 display 隐藏整块标签：光靠 hidden 属性压不住作者层的 display
    this.setPartHidden(this.getPart('root'), !api.open)
  }
}
