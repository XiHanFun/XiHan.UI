/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { ControlVariant, Direction, Size, Tone } from '@xihan-ui/core'
import type {
  GridListActionDetails,
  GridListNode,
  GridListRowProps,
  GridListSchema,
  GridListSelectionMode,
  GridListTranslations,
  GridListValueChangeDetails,
} from '@xihan-ui/headless'
import { connectGridList, gridListAnatomy, gridListMachine, gridListMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (value: string | null) => (value === null ? undefined : value !== 'false') }

/**
 * xh-grid-list —— 可选择、可承载行内按钮的非表格集合。拖动通过 xh-sortable 组合，
 * 行本身使用 grid/row/gridcell 语义，不把行内按钮伪装成 option 的后代。
 *
 * @customElement xh-grid-list
 * @attr {string} value - 受控选中值；多选数组走 property
 * @attr {string} default-value - 非受控初始值
 * @attr {'none'|'single'|'multiple'} selection-mode - 选择模式，默认 single
 * @attr {boolean} disabled - 整体禁用
 * @attr {boolean} read-only - 只读：可浏览和使用行内按钮，不可改变选择
 * @attr {boolean} invalid - 校验失败
 * @attr {boolean} loading - 正在加载
 * @attr {boolean} loop - 方向键到边界后是否回绕
 * @attr {boolean} typeahead - 是否启用连打检索
 * @attr {'outline'|'subtle'|'ghost'} variant - 容器形态
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 选中语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选择变化；detail 为 { value: string[] }
 * @fires action - 行主操作；detail 为 { value: string }
 * @csspart root - role=grid 的集合根
 * @csspart label - 可见标题
 * @csspart row - role=row 的一行
 * @csspart row-selection-indicator - 选择标记
 * @csspart row-content - 行主要内容的 gridcell
 * @csspart row-text - 行标题
 * @csspart row-description - 行说明
 * @csspart row-actions - 行内按钮所在的 gridcell
 * @csspart row-action - 行内动作按钮
 * @csspart empty - 空态
 * @csspart loading - 加载态
 */
export class XhGridListElement extends XhElement {
  static override partContract = { anatomy: gridListAnatomy, meta: gridListMeta }

  static override properties = {
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
    // 与 Sortable 等嵌套宿主组合时，行可作为显式外部角色根交进来。
    partRoots: { attribute: false },
  }

  declare collection?: GridListNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare selectionMode?: GridListSelectionMode
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare loop?: boolean
  declare typeahead?: boolean
  declare direction?: Direction
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<GridListTranslations>
  declare partRoots?: HTMLElement[]

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.partRoots ?? []
  }

  private readonly declaredRowDisabled = createDeclaredDisabled()
  // 无 collection 时行自身禁用声明的快照。connect 每帧都把 aria-disabled 写回行，整体禁用更是写满每一行，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，解禁后行就永远解不开。
  private readonly markupDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整体禁用：解禁当帧 DOM 上仍保留着状态机写回的 aria-disabled，不可读取。 */
  private wasGridDisabled = false
  private readonly notifyValue = (details: GridListValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyAction = (details: GridListActionDetails): void => {
    this.dispatchEvent(new CustomEvent('action', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<GridListSchema>(this, gridListMachine, () => this.machineProps())

  private machineProps(): Partial<GridListSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      selectionMode: this.selectionMode,
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      loading: this.loading,
      loop: this.loop,
      typeahead: this.typeahead,
      dir: this.direction,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onAction: this.notifyAction,
    }
  }

  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(part => owner.contains(part))
  }

  /**
   * 无 collection 时行的禁用声明。原生 disabled 每轮接线都会被摘掉，还留在节点上就只能是作者刚写的；
   * aria-disabled 只有在「头一回见到这行」（本帧写回尚未发生）或「本帧与上一帧都没整体禁用」时才等于作者声明，
   * 其余帧沿用快照——整体禁用那几帧 connect 把每行都写成了 true，解禁当帧 DOM 上还留着这些写回值。
   */
  private markupRowDisabled(row: HTMLElement): boolean {
    if (row.hasAttribute('disabled'))
      this.markupDisabled.set(row, true)
    else if (!this.markupDisabled.has(row) || (!this.disabled && !this.wasGridDisabled))
      this.markupDisabled.set(row, row.getAttribute('aria-disabled') === 'true')
    return this.markupDisabled.get(row)!
  }

  /** 读行的禁用声明，并摘掉作者写的原生 disabled，禁用态归一到 aria-disabled。 */
  private rowProps(row: HTMLElement): GridListRowProps {
    const disabled = this.collection
      ? this.declaredRowDisabled(row)
      : this.markupRowDisabled(row)
    // row 不是表单控件，原生 disabled 在它上面不是有效属性；摘掉之后由 connect 写回的 aria-disabled 承接，下一轮接线照样读得到
    if (row.hasAttribute('disabled'))
      row.removeAttribute('disabled')
    return { value: row.getAttribute('value') ?? '', disabled }
  }

  protected wire(): void {
    const api = connectGridList(this.ctrl.service, wcNormalize)
    const put = (name: string, props: Record<string, unknown>): void => {
      const part = this.getPart(name)
      if (part)
        this.spreader.spread(part, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('loading', api.getLoadingProps() as Record<string, unknown>)

    for (const rowElement of this.getParts('row')) {
      const row = this.rowProps(rowElement)
      this.spreader.spread(rowElement, api.getRowProps(row) as Record<string, unknown>)
      const bindings: Array<[string, (props: GridListRowProps) => unknown]> = [
        ['row-selection-indicator', api.getRowSelectionIndicatorProps],
        ['row-content', api.getRowContentProps],
        ['row-text', api.getRowTextProps],
        ['row-description', api.getRowDescriptionProps],
        ['row-actions', api.getRowActionsProps],
        ['row-action', api.getRowActionProps],
      ]
      for (const [name, getter] of bindings) {
        for (const part of this.partsIn(rowElement, name))
          this.spreader.spread(part, getter(row) as Record<string, unknown>)
      }
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGridDisabled = !!this.disabled
  }
}
