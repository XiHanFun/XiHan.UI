/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FieldArrayApi, FieldArrayItemProps, FieldArraySchema, FieldArrayTranslations, FieldArrayValueChangeDetails, FormControlState, FormPath, FormSchema } from '@xihan-ui/headless'
import { connectFieldArray, fieldArrayAnatomy, fieldArrayMachine, fieldArrayMeta, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 与 form.ts 共享的私有适配器槽；不把内部服务暴露成自定义元素 API。
const FORM_SERVICE = Symbol.for('xh.form.service')
type FormHost = HTMLElement & { [FORM_SERVICE]?: Service<FormSchema> }

// 属性缺席翻成 undefined，以此区分受控与非受控。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

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
 * 行节点由作者按当前值渲染（一行一个 item，身份取节点上的 index 属性，默认按文档序），
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
 * @attr {string} name - 整份数组的表单字段名；嵌套 Form 时自动使用同一条 FormPath 真源
 * @fires value-change - 数据数组变化；detail 为 `{ value: unknown[] }`
 * @csspart root - 整份列表的容器，承载 data-disabled / data-empty / data-at-min / data-at-max / data-movable
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
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      createItem: this.createItem,
      movable: this.movable ?? false,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      name: this.name,
      translations: this.translations,
      onValueChange: this.notifyValue,
    }
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
    put('add-trigger', api.getAddTriggerProps() as Record<string, unknown>)

    // 行是多实例 part，逐个打：身份取作者写在节点上的 index，缺省按文档序
    this.getParts('item').forEach((el, position) => {
      const item: FieldArrayItemProps = { index: declaredIndex(el, position) }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'item-label'))
        this.spreader.spread(label, api.getItemLabelProps(item) as Record<string, unknown>)
      for (const content of this.partsIn(el, 'item-content'))
        this.spreader.spread(content, api.getItemContentProps(item) as Record<string, unknown>)
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
