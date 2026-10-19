/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-tour>：设计器的新手引导。库内 xh-tour 包一层：designer-shell 的通用步骤（欢迎、工具栏、物料、画布、属性、
// 问题、状态栏、设置）加上设计器交进来的各款与扩展的步骤，按 order 排；目标是外框的面板、区、工具栏上的命令或选择器，
// 目标面板隐藏或不在外框里的那一步跳过，进入一步前让外框把面板亮出来（展开收起的栏、标题条，窄屏时开抽屉）。
// 引导限在外框里：遮罩只盖外框，高亮框裁在外框里，页面别处照常可用；同一页只跑一个引导。
// 收起时派发 tour-end：走完是 complete，跳过或 Esc 是 skip，关闭钮或 stop() 是 close。

import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { XhDesignerFrameElement } from '../frame/frame-element'
import type { DesignerTourTranslations } from '../translations'
import type { DesignerTourStepView, DesignerTourTarget } from './tour'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineTourElements } from '../internal/ui-elements'

/** 引导派发的事件。 */
export interface DesignerTourEventMap {
  /** 引导收起了：reason 是 complete（走完）、skip（跳过或 Esc）或 close（关闭钮或 stop()）；step 是收起时那一步的 id。 */
  'tour-end': CustomEvent<{ reason: 'complete' | 'skip' | 'close', step: string | undefined }>
}

const DEFAULT_TRANSLATIONS: DesignerTourTranslations = {
  prev: 'Back',
  next: 'Next',
  finish: 'Done',
  skip: 'Skip',
  close: 'Close tour',
  progress: (step, count) => `Step ${step} of ${count}`,
  welcomeTitle: 'Welcome',
  welcomeDescription: 'A quick look at the parts of the designer. You can take this tour again from the settings.',
  toolbarTitle: 'Toolbar',
  toolbarDescription: 'Frequently used commands. You can choose which buttons to show in the settings.',
  paletteTitle: 'Palette',
  paletteDescription: 'Drag an item onto the canvas, or click it to add it.',
  canvasTitle: 'Canvas',
  canvasDescription: 'Select, move and resize what you are designing here.',
  propertiesTitle: 'Properties',
  propertiesDescription: 'Edit the selected object.',
  issuesTitle: 'Problems',
  issuesDescription: 'Problems found in the design. Select one to go to it.',
  statusTitle: 'Status bar',
  statusDescription: 'What is selected and the current zoom.',
  settingsTitle: 'Settings',
  settingsDescription: 'Change the theme, panel layout and toolbar buttons here, or take this tour again.',
}

const TAG = 'xh-designer-tour'
const SCOPE = 'designer-tour'

type TextKey = { [K in keyof DesignerTourTranslations]: DesignerTourTranslations[K] extends string ? K : never }[keyof DesignerTourTranslations]

/** designer-shell 的通用步骤。 */
const BUILTIN_STEPS: readonly { readonly id: string, readonly target?: DesignerTourTarget, readonly order: number, readonly title: TextKey, readonly description: TextKey }[] = [
  { id: 'shell.welcome', order: 0, title: 'welcomeTitle', description: 'welcomeDescription' },
  { id: 'shell.toolbar', target: { region: 'toolbar' }, order: 10, title: 'toolbarTitle', description: 'toolbarDescription' },
  { id: 'shell.palette', target: { panel: 'palette' }, order: 20, title: 'paletteTitle', description: 'paletteDescription' },
  { id: 'shell.canvas', target: { region: 'canvas' }, order: 30, title: 'canvasTitle', description: 'canvasDescription' },
  { id: 'shell.properties', target: { panel: 'properties' }, order: 40, title: 'propertiesTitle', description: 'propertiesDescription' },
  { id: 'shell.issues', target: { panel: 'issues' }, order: 50, title: 'issuesTitle', description: 'issuesDescription' },
  { id: 'shell.status', target: { region: 'status' }, order: 60, title: 'statusTitle', description: 'statusDescription' },
  { id: 'shell.settings', target: { command: 'settings' }, order: 900, title: 'settingsTitle', description: 'settingsDescription' },
]

/** 每个文档里此刻开着的引导：同一页只跑一个。 */
const RUNNING = new WeakMap<Document, XhDesignerTourElement>()

const REGION_SELECTOR = '[data-part="region"][data-region]'

/** root 下按 selector 找到、attribute 等于 value 的第一个节点；值不拼进选择器，名字里有什么字符都行。 */
function byAttribute<T extends Element>(root: ParentNode | null | undefined, selector: string, attribute: string, value: string): T | null {
  for (const node of root?.querySelectorAll<T>(selector) ?? []) {
    if (node.getAttribute(attribute) === value)
      return node
  }
  return null
}

type TourHost = HTMLElement & { steps?: unknown[], open?: boolean, value?: number, boundary?: () => HTMLElement | null, translations?: Record<string, unknown> }

interface Parts {
  readonly tour: TourHost
  readonly dots: HTMLElement
  readonly prev: HTMLElement
  readonly next: HTMLElement
  readonly skip: HTMLElement
  readonly close: HTMLElement
}

export class XhDesignerTourElement extends XhReactiveElement {
  static override properties = {
    frame: { attribute: false },
    steps: { attribute: false },
    builtin: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 设计器的外框：解析目标、判断面板显隐、进入一步前把面板亮出来。 */
  declare frame: XhDesignerFrameElement | undefined
  /** 各款与扩展的步骤（resolveTourSteps 取好的），与通用步骤一起按 order 排。 */
  declare steps: readonly DesignerTourStepView[] | undefined
  /** 带上 designer-shell 的通用步骤，缺省 true；同名 attribute 写 "false" 不带。 */
  declare builtin: boolean | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerTourTranslations> | undefined

  /** 注册引导用到的库内元素。 */
  static defineDependencies(): void {
    defineTourElements()
  }

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  /** 这一次引导的各步，start() 时排好。 */
  #run: readonly DesignerTourStepView[] = []
  #running = false
  /** 收起时的起因：complete、skip 事件先到，open-change 收起时才派发 tour-end。 */
  #reason: 'complete' | 'skip' | undefined
  /** 开始引导时外框窄屏抽屉的开合：引导打开的抽屉在不需要时、以及收起时还原成它。 */
  #drawer: 'start' | 'end' | undefined

  /** 引导此刻开着。 */
  get running(): boolean {
    return this.#running
  }

  /** 此刻会走的各步：通用步骤（builtin 不为 false 时）与交进来的步骤按 order 排，去掉目标面板隐藏或不在外框里的。 */
  plannedSteps(): readonly DesignerTourStepView[] {
    const t = this.#translations()
    const builtin: DesignerTourStepView[] = this.builtin === false
      ? []
      : BUILTIN_STEPS.map(step => ({ id: step.id, ...(step.target ? { target: step.target } : {}), title: t[step.title], description: t[step.description], order: step.order }))
    return [...builtin, ...this.steps ?? []]
      .map((step, index) => ({ step, index }))
      .sort((a, b) => (a.step.order ?? 0) - (b.step.order ?? 0) || a.index - b.index)
      .map(({ step }) => step)
      .filter(step => this.#available(step.target))
  }

  /**
   * 开始引导，从第一步起；没有能走的步骤时返回 false。同一页里已有别的引导开着时：缺省不开始、返回 false
   * （自动开始用这个），force 为 true 时先收起那一个（用户手动开始用这个）。
   */
  start(options: { readonly force?: boolean } = {}): boolean {
    const other = RUNNING.get(this.ownerDocument)
    if (other !== undefined && other !== this && other.running) {
      if (!options.force)
        return false
      other.stop()
    }
    const steps = this.plannedSteps()
    if (steps.length === 0)
      return false
    const parts = this.#ensureParts()
    if (!this.#running)
      this.#drawer = this.frame?.openDrawer
    this.#run = steps
    this.#reason = undefined
    parts.tour.steps = steps.map(step => ({
      id: step.id,
      target: step.target === undefined ? null : () => this.#resolve(step.target!),
      title: step.title,
      description: step.description,
      ...(step.placement ? { placement: step.placement } : {}),
    }))
    parts.dots.replaceChildren(...steps.map((_, index) => createAuthoredElement(this.ownerDocument, 'div', { 'data-xh-part': 'progress-dot', 'index': index })))
    this.#reveal(0)
    parts.tour.value = 0
    parts.tour.open = true
    this.#running = true
    RUNNING.set(this.ownerDocument, this)
    this.#paint()
    return true
  }

  /** 收起引导；派发 tour-end，reason 为 close。 */
  stop(): void {
    if (this.#running && this.#parts)
      this.#finish('close')
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.stop()
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    this.#ensureParts()
    this.#paint()
  }

  #translations(): DesignerTourTranslations {
    return this.#config.translations<DesignerTourTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
  }

  #ensureParts(): Parts {
    if (this.#parts?.tour.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const prev = createAuthoredElement(doc, 'button', { 'data-xh-part': 'prev-trigger', 'type': 'button' })
    const next = createAuthoredElement(doc, 'button', { 'data-xh-part': 'next-trigger', 'type': 'button' })
    const skip = createAuthoredElement(doc, 'button', { 'data-xh-part': 'skip-trigger', 'type': 'button' })
    const close = createAuthoredElement(doc, 'button', { 'data-xh-part': 'close-trigger', 'type': 'button' })
    const dots = createAuthoredElement(doc, 'div', { 'data-xh-part': 'progress-indicator' })
    const tour: TourHost = createGeneratedElement(doc, 'xh-tour', { 'data-scope': SCOPE, 'data-part': 'tour' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'backdrop' }),
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'spotlight' }),
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [
            createAuthoredElement(doc, 'div', { 'data-xh-part': 'title' }),
            createAuthoredElement(doc, 'div', { 'data-xh-part': 'description' }),
            createAuthoredElement(doc, 'div', { 'data-xh-part': 'progress-text' }),
            dots,
            createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'actions' }, [skip, prev, next]),
            close,
            createAuthoredElement(doc, 'div', { 'data-xh-part': 'arrow' }),
          ]),
        ]),
      ]),
    ])
    tour.open = false
    tour.boundary = () => this.frame ?? null
    tour.addEventListener('value-change', (event) => {
      if (event.target !== tour)
        return
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: number }>).detail
      this.#reveal(value)
      tour.value = value
      this.#paint()
    })
    tour.addEventListener('complete', (event) => {
      if (event.target === tour)
        this.#reason = 'complete'
    })
    tour.addEventListener('skip', (event) => {
      if (event.target === tour)
        this.#reason = 'skip'
    })
    tour.addEventListener('open-change', (event) => {
      if (event.target !== tour)
        return
      event.stopPropagation()
      if (!(event as CustomEvent<{ open: boolean }>).detail.open)
        this.#finish(this.#reason ?? 'close')
    })
    this.append(tour)
    this.#parts = { tour, dots, prev, next, skip, close }
    return this.#parts
  }

  #finish(reason: 'complete' | 'skip' | 'close'): void {
    const parts = this.#parts!
    const step = this.#run[parts.tour.value ?? 0]?.id
    parts.tour.open = false
    if (!this.#running)
      return
    this.#running = false
    this.#reason = undefined
    if (RUNNING.get(this.ownerDocument) === this)
      RUNNING.delete(this.ownerDocument)
    this.#restoreDrawer()
    emitEvent(this, 'tour-end', { reason, step })
  }

  /** 外框窄屏抽屉还原成开始引导时的样子。 */
  #restoreDrawer(): void {
    const frame = this.frame
    if (frame && frame.openDrawer !== this.#drawer)
      frame.openDrawer = this.#drawer
  }

  #paint(): void {
    const parts = this.#parts
    if (!parts)
      return
    const t = this.#translations()
    parts.tour.translations = { close: t.close, progress: t.progress, next: t.next, finish: t.finish }
    const last = (parts.tour.value ?? 0) >= this.#run.length - 1
    setText(parts.prev, t.prev)
    setText(parts.next, last ? t.finish : t.next)
    setText(parts.skip, t.skip)
  }

  /** 进入一步前：目标是面板就让外框把它亮出来；不是面板时，引导打开的窄屏抽屉收回去，免得盖住这一步的目标。 */
  #reveal(index: number): void {
    const target = this.#run[index]?.target
    if (target && 'panel' in target)
      this.frame?.revealPanel(target.panel)
    else
      this.#restoreDrawer()
  }

  /** 这一步此刻能不能走：面板与区要在外框里且显示着，命令要有它的按钮。 */
  #available(target: DesignerTourTarget | undefined): boolean {
    if (target === undefined)
      return true
    const frame = this.frame
    if ('panel' in target)
      return frame?.showsPanel(target.panel) ?? false
    if ('region' in target)
      return frame?.showsPanel(target.region) ?? false
    if ('command' in target)
      return this.#commandButton(target.command) !== null
    return true
  }

  #commandButton(command: string): HTMLButtonElement | null {
    return byAttribute<HTMLButtonElement>(this.frame ?? this.parentElement, 'xh-toolbar button[value]', 'value', command)
  }

  /** 目标此刻的节点：工具栏上收进「更多」的命令指向「更多」钮。 */
  #resolve(target: DesignerTourTarget): HTMLElement | null {
    const frame = this.frame
    if ('panel' in target) {
      const region = byAttribute<HTMLElement>(frame, REGION_SELECTOR, 'data-region', target.panel)
      return target.part === undefined ? region : byAttribute<HTMLElement>(region, '[data-part]', 'data-part', target.part)
    }
    if ('region' in target)
      return byAttribute<HTMLElement>(frame, REGION_SELECTOR, 'data-region', target.region)
    if ('command' in target) {
      const button = this.#commandButton(target.command)
      if (button?.hidden)
        return button.closest('xh-toolbar')?.querySelector<HTMLElement>('[data-part="overflow-trigger"], [data-xh-part="overflow-trigger"]') ?? null
      return button
    }
    return (this.parentElement ?? this.ownerDocument).querySelector<HTMLElement>(target.selector)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-tour': XhDesignerTourElement
  }
}
