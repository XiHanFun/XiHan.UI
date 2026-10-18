/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArrayColumn, FieldArrayItem, FieldArrayItemProps, FieldArrayLayout, FieldArraySchema, FieldArrayTranslations, FieldArrayValueChangeDetails, FormControlState, FormPath, FormSchema } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { connectFieldArray, fieldArrayAnatomy, fieldArrayMachine, fieldArrayMeta, fieldArrayStructure, resolveFormControlState } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 与 form.ts 共享的私有适配器槽；不把内部服务暴露成自定义元素 API。
const FORM_SERVICE = Symbol.for('xh.form.service')
type FormHost = HTMLElement & { [FORM_SERVICE]?: Service<FormSchema> }

// 属性缺席翻成 undefined，以此区分受控与非受控。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/** 作者写在行上的下标。缺席或写错时退回文档序：把行按顺序排列本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-field-array>`：Light-DOM 行为宿主：作者写 root / item / item-content / item-action 与
 * add-trigger、item-delete-trigger、move-up-trigger、move-down-trigger 角色节点，
 * 元素运行 field-array 状态机并把 connect 产出接上。
 *
 * 值是宿主自己的数据数组，元素只负责增删与换序这套动作，行中放置的控件由作者写进 item-content。
 * 不写部件（或只写 root）时元素按标准结构生成：列表排布下每行是行号、作者内容与把手（开了 movable 时有上移与下移，
 * 再是删除），表格排布下是表格本体里的表头与各行、行里每列一格；最后是新增把手（文字取 translations.addTrigger）。
 * 每行的作者内容写在宿主的直接子节点上：列表排布 `slot="item-content:<行 key>"`，表格排布 `slot="item-cell:<行 key>:<列 id>"`，
 * 元素把它挪进对应的格子；行 key 从只读的 `items` 上读，换序时内容跟着行走。没给内容的行就空着，不报缺部件。
 * value-change 同步派发、早于结构重铺：在它的处理函数里按 `items` 补上新行的内容，新行在同一帧就带上内容。
 * 删掉的行的内容先别删：原处淡出的替身克隆的是离场的那一行，内容要还在行里；行离场后它回到宿主、
 * 成为宿主的直接子节点，下一帧再把对不上 `items` 的删掉。
 *
 * 手写部件时行节点由作者按当前值渲染（一行一个 item，身份取节点上的 index 属性，默认按文档序），
 * 值变化时由作者侧增删行节点，修改后 MutationObserver 会自动重新接线。
 *
 * 数据数组、造行工厂与读屏文案都无法表达为属性，三者只作为 property 暴露。
 *
 * @customElement xh-field-array
 * @attr {number} min - 最少行数；到达后删除把手不可按下
 * @attr {number} max - 最多行数；到达后新增把手不可按下
 * @attr {boolean} movable - 是否显示换序把手；关闭时两个换序把手一律收起
 * @attr {boolean} disabled - 禁用：新增、删除、换序三路都不可按下
 * @attr {boolean} read-only - 只读：行数不可修改，行内的控件由作者自行设置只读
 * @attr {boolean} invalid - 校验失败标注；写在根与每一行上
 * @attr {'list'|'table'} layout - 排布：list（缺省）一行一条纵向堆叠；table 是 role=table 的表格，表头与各行共用一套列宽
 * @attr {string} name - 整份数组的表单字段名；嵌套 Form 时自动使用同一条 FormPath 真源
 * @fires value-change - 数据数组变化；detail 为 `{ value: unknown[], mutation? }`，本组的增、删、移与整份写值带上 mutation（insert / remove / move / replace）
 * @csspart root - 整份列表的容器，承载 data-disabled / data-empty / data-at-min / data-at-max / data-movable / data-layout；两种排布下都不带角色
 * @csspart table - 表格排布的表格本体（role=table），表头与各行放在它里面，add-trigger 仍是 root 的最后一个子节点；
 *   放进字段时字段的标签与说明接到它上面，不在字段里时宿主上的 aria-label 转给它。列表排布下不带角色
 * @csspart header - 表格排布的表头行（role=row，第 1 行）；列表排布下收起
 * @csspart column-header - 列头（role=columnheader），须自带 value 属性写列 id；留空即由元素填入这一列的 label
 * @csspart item-cell - 行里的一格（role=cell），须自带 value 属性写列 id；只在表格排布下使用
 * @csspart item - 一行一个，可自带 index 属性声明下标，默认按文档序
 * @csspart item-label - 一行前面的行号或名目；纯标注
 * @csspart item-content - 一行中放置作者自己控件的位置
 * @csspart item-action - 一行中放置把手的位置
 * @csspart add-trigger - 新增把手，须是原生 `<button>`；到上限时为 aria-disabled 但仍可聚焦；名字取自身内容
 * @csspart item-delete-trigger - 删除把手，须是原生 `<button>`；到下限时为 aria-disabled；自带 aria-label
 * @csspart move-up-trigger - 上移把手，须是原生 `<button>`；首行为 aria-disabled；自带 aria-label
 * @csspart move-down-trigger - 下移把手，须是原生 `<button>`；末行为 aria-disabled；自带 aria-label
 */
export class XhFieldArrayElement extends XhElement {
  static override partContract = { anatomy: fieldArrayAnatomy, meta: fieldArrayMeta }
  // 放进字段时字段的标签与说明落在表格本体上（组类接线）
  static override fieldTarget = { parts: ['table'], kind: 'group' } as const

  /** 作者没写结构时按标准结构生成：各行（或表格本体里的表头与各行）与新增把手。 */
  static override structure: ElementStructure<XhFieldArrayElement> = {
    build: host => host.ctrl.service ? fieldArrayStructure(connectFieldArray(host.ctrl.service, wcNormalize)) : undefined,
  }

  // 列表排布下表格部件不带角色，不承接字段的名字与说明
  protected override acceptsFieldWiring(): boolean {
    return this.layout === 'table'
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 宿主的行数据是任意值，属性表达不了，只走 property
    value: { attribute: false },
    defaultValue: { attribute: false },
    min: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    createItem: { attribute: false },
    movable: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    layout: { converter: STRING_CONVERTER },
    // 列定义是数组，只走 property
    columns: { attribute: false },
    name: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: unknown[]
  declare defaultValue?: unknown[]
  declare min?: number
  declare max?: number
  declare createItem?: () => unknown
  declare movable?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare layout?: FieldArrayLayout
  declare columns?: FieldArrayColumn[]
  declare name?: FormPath
  declare translations?: Partial<FieldArrayTranslations>

  private readonly notifyValue = (details: FieldArrayValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // 机器只有一个还焦点的收尾动作（自己经 scope 取节点），不需要 config/layer/定位引擎，
  // 故 controller 只带 props。
  private readonly ctrl = new MachineController<FieldArraySchema>(this, fieldArrayMachine, () => this.machineProps(), {
    // 列表动效经它取行所在的根节点
    onBuilt: svc => svc.refs.set('getRootEl', () => this.getPart('root')),
  })

  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；FieldArray 仅消费公开的禁用、只读、无效三轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<FieldArraySchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      ariaLabel: this.hostAriaLabel(),
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      createItem: this.createItem,
      movable: this.movable ?? false,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      layout: this.layout,
      columns: this.columns,
      name: this.name,
      translations: this.translations,
      onValueChange: this.notifyValue,
    }
  }

  /**
   * 逐行的读侧投影，含组件分配的行 key；状态机还没建立时为空数组。
   * 标准结构下作者按 key 写每行内容的 slot 名（`item-content:<key>` / `item-cell:<key>:<列 id>`）。
   */
  get items(): FieldArrayItem[] {
    return this.ctrl.service ? connectFieldArray(this.ctrl.service, wcNormalize).items : []
  }

  /** 命令式入口共用的取法；状态机在进入文档（hostConnected）后才建立，未建立则抛错。 */
  private commands(): FieldArrayApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-field-array> 还没进文档，命令式接口此时不可用')
    return connectFieldArray(this.ctrl.service, wcNormalize)
  }

  /** 整份替换，不受 min / max 约束。 */
  setValue(next: unknown[]): void {
    this.commands().setValue(next)
  }

  /** 在末尾追加一行，数据由 createItem 造；受 max 约束。 */
  add(): void {
    this.commands().add()
  }

  /** 在 index 处插入一行（夹到 0 到行数之间），后面的行往后挪；给了 item 就用它作这一行的数据，缺省由 createItem 造。受 max 约束。 */
  insert(index: number, item?: unknown): void {
    this.commands().insert(index, item)
  }

  /** 删掉第 index 行；受 min 约束。不叫 remove：那是 Element 自己把元素移出文档的方法。 */
  removeItem(index: number): void {
    this.commands().remove(index)
  }

  /** 把第 from 行挪到第 to 行的位置；要求开启 movable。 */
  move(from: number, to: number): void {
    this.commands().move(from, to)
  }

  /** 第 index 行上移一格。 */
  moveUp(index: number): void {
    this.commands().moveUp(index)
  }

  /** 第 index 行下移一格。 */
  moveDown(index: number): void {
    this.commands().moveDown(index)
  }

  /** 元素代填的文字：首次见到该节点时若已有内容则归作者，之后不再改写。 */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()

  private fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (owned && el.textContent !== text)
      el.textContent = text
  }

  // 行内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const form = this.closest('xh-form') as FormHost | null
    this.ctrl.service.refs.set('form', form?.[FORM_SERVICE] ?? null)
    const api = connectFieldArray(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    // 作者在表格节点上自己写了名字时不覆盖
    const tableEl = this.getPart('table')
    if (tableEl)
      this.spreader.spread(tableEl, this.withAuthoredName(tableEl, api.getTableProps() as Record<string, unknown>))
    put('header', api.getHeaderProps() as Record<string, unknown>)
    for (const el of this.getParts('column-header')) {
      const value = el.getAttribute('value') ?? ''
      this.spreader.spread(el, api.getColumnHeaderProps({ value }) as Record<string, unknown>)
      const label = api.columns.find(column => column.id === value)?.label
      if (label != null)
        this.fillText(el, label)
    }
    put('add-trigger', api.getAddTriggerProps() as Record<string, unknown>)

    // 行是多实例 part，逐个打：身份取作者写在节点上的 index，缺省按文档序
    this.getParts('item').forEach((el, position) => {
      const item: FieldArrayItemProps = { index: declaredIndex(el, position) }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'item-label'))
        this.spreader.spread(label, api.getItemLabelProps(item) as Record<string, unknown>)
      for (const content of this.partsIn(el, 'item-content'))
        this.spreader.spread(content, api.getItemContentProps(item) as Record<string, unknown>)
      for (const cell of this.partsIn(el, 'item-cell'))
        this.spreader.spread(cell, api.getItemCellProps({ index: item.index, value: cell.getAttribute('value') ?? '' }) as Record<string, unknown>)
      for (const action of this.partsIn(el, 'item-action'))
        this.spreader.spread(action, api.getItemActionProps(item) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'item-delete-trigger'))
        this.spreader.spread(trigger, api.getItemDeleteTriggerProps(item) as Record<string, unknown>)
      // 不换序时把这对把手收起。只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条
      // display 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
      for (const trigger of this.partsIn(el, 'move-up-trigger')) {
        this.spreader.spread(trigger, api.getMoveUpTriggerProps(item) as Record<string, unknown>)
        this.setPartHidden(trigger, !api.movable)
      }
      for (const trigger of this.partsIn(el, 'move-down-trigger')) {
        this.spreader.spread(trigger, api.getMoveDownTriggerProps(item) as Record<string, unknown>)
        this.setPartHidden(trigger, !api.movable)
      }
    })
  }
}
