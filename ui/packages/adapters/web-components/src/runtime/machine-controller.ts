/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 machine controller 相关实现。

import type { Disposable, MachineConfig, MachineSchema, Scope, Service } from '@xihan-ui/core'
import type { XhConfig } from '../config'
import type { ReactiveController, ReactiveControllerHost } from '../reactive'
import type { LitRuntime } from './lit-runtime'
import { createFormResetBridge, createService, declaresFormReset, FORM_RESET_EVENT } from '@xihan-ui/core'
import { withXhConfigBase } from '@xihan-ui/headless'
import { resolveXhConfig, xhConfigGeneration } from '../config'
import { createLitRuntime } from './lit-runtime'

export interface MachineControllerOptions<T extends MachineSchema> {
  scope?: Scope
  /** 每次建立状态机后回调，用于注入 refs。 */
  onBuilt?: (service: Service<T>) => void
  /**
   * 全局配置从哪个桶中取，默认取状态机名。
   * 只有运行其他组件状态机的元素需要写它：例如通知的卡片运行的是 toast 的状态机，
   * 文案却应跟随通知。
   */
  configName?: string
}

/** 初值类 prop 的键：defaultValue、defaultOpen、defaultWindow…… */
const SEED_KEY = /^default[A-Z]/

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null)
    return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/** 初值按内容比：作者再给一份内容相同的新数组 / 对象，不算换了初值。 */
function sameSeed(a: unknown, b: unknown): boolean {
  if (Object.is(a, b))
    return true
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, i) => sameSeed(item, b[i]))
  if (a instanceof Date && b instanceof Date)
    return Object.is(a.getTime(), b.getTime())
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && sameSeed(a[key], b[key]))
  }
  return false
}

function seedsOf(props: object): Map<string, unknown> {
  const seeds = new Map<string, unknown>()
  for (const [key, value] of Object.entries(props)) {
    if (SEED_KEY.test(key))
      seeds.set(key, value)
  }
  return seeds
}

function seedsChanged(seeds: ReadonlyMap<string, unknown>, props: object): boolean {
  for (const [key, value] of Object.entries(props)) {
    if (SEED_KEY.test(key) && !sameSeed(seeds.get(key), value))
      return true
  }
  return false
}

// 一台机器一个 controller：hostConnected 建机器并 mount、hostUpdate 跑 trackers、hostDisconnected unmount。
export class MachineController<T extends MachineSchema> implements ReactiveController {
  service!: Service<T>
  private runtime: LitRuntime | undefined
  private started = false
  private connected = false
  private formReset: Disposable | undefined

  private readonly props: () => Partial<T['props']>
  /** 缓存的配置解析结果与它对应的代号。 */
  private resolved: XhConfig | undefined
  private resolvedAt = -1

  /** 建这台机器时各 default* 的取值。 */
  private seeds: ReadonlyMap<string, unknown> = new Map()
  /** 挂载完成那一刻的状态节点。 */
  private settledState: string | undefined
  /** 状态已被写过，default* 从此只作 reset 与表单重置的落点。 */
  private live = false

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly machine: MachineConfig<T>,
    private readonly rawProps: () => Partial<T['props']>,
    private readonly opts: MachineControllerOptions<T> = {},
  ) {
    // 全局配置在这一处并进来：所有跑机器的元素都从这里取 props，不必逐个接线。
    // 传宿主元素而不是只看全局那份：配置沿 DOM 祖先链解析，作者用 <xh-config> 包住一棵子树即可局部覆盖
    const bucket = this.opts.configName ?? machine.name
    this.props = () => withXhConfigBase(bucket, rawProps(), this.config())
    host.addController(this)
    // 延到 hostConnected 再 build，构造期 attribute 尚未反射到 reactive property。
  }

  /**
   * 这个元素解析到的配置。
   *
   * 状态机每读一个 prop 都会经过这里，而解析一次要沿祖先链逐层判「这一层是不是 <xh-config>」，
   * 深一点的页面里这条链比取值器本身还贵。结果按配置代号缓存：全局那份改了、任一 <xh-config>
   * 改了或进出文档都会让代号自增；元素自己换位置会先断开再接上，那条路径在 hostConnected 里作废。
   */
  private config(): XhConfig {
    const generation = xhConfigGeneration()
    if (this.resolved === undefined || this.resolvedAt !== generation) {
      this.resolvedAt = generation
      this.resolved = resolveXhConfig(this.host instanceof Element ? this.host : null)
    }
    return this.resolved
  }

  private build(): void {
    this.runtime = createLitRuntime(this.host)
    this.service = createService(this.machine, { props: this.props, runtime: this.runtime, scope: this.opts.scope })
    this.seeds = seedsOf(this.rawProps())
    this.live = false
    this.opts.onBuilt?.(this.service)
  }

  /** mount 完才记下初态：挂载途中排进来的事件也算在初态里。 */
  private mount(): void {
    this.runtime!.mount()
    this.settledState = this.service.state.get()
  }

  hostConnected(): void {
    // 换过位置就是换了一条祖先链，缓存的配置作废；首次接上也从这里起算
    this.resolved = undefined
    this.connected = true
    // 首次或旧机器已停止时重建，从 initialState 起。
    if (!this.started || this.service.getStatus() === 'Stopped') {
      this.build()
      this.started = true
      this.mount()
    }
    else {
      this.runtime!.mount()
    }
    // 必须在 mount 之后：桥一挂就可能送事件进来，而 mount 之前送会撞上 SEND_BEFORE_MOUNT
    this.attachFormReset()
  }

  /**
   * 状态被写过之前，default* 一变就按新的初值重建状态机。
   *
   * WC 的 property 可以在元素连上之后才到：HTML 里的元素先被升级并连接，脚本排在之后的任务里才赋值。
   * 这段时间里的赋值与连接前就写好等价。「写过」指挂载完成后状态节点变过，或对外报告变化的 cell
   * （default* 与受控值对应的那类）被改过——用户交互、方法调用、表单重置都会走到这里；
   * 从那以后 default* 只作 reset 与表单重置的落点，与 Vue / React 里「初值只取一次」一致。
   */
  private reseed(): void {
    if (this.live || !this.connected || this.runtime === undefined)
      return
    if (this.runtime.written() || this.service.state.get() !== this.settledState) {
      this.live = true
      return
    }
    if (!seedsChanged(this.seeds, this.rawProps()))
      return
    // 与断开再接上走同一条路：停掉旧机器（撤 effect），按当下 props 从 initialState 建起。
    // 表单重置桥按调用时的 this.service 取机器，不必重挂
    this.runtime.unmount()
    this.build()
    this.mount()
  }

  /** 元素自己就是锚点（Light DOM）。重连时重建，指向新的状态机。 */
  private attachFormReset(): void {
    if (this.formReset || !declaresFormReset(this.machine))
      return
    const host = this.host as unknown
    if (!(host instanceof Element))
      return
    this.formReset = createFormResetBridge({
      getNode: () => host,
      getFormId: () => this.service.prop('form') as string | undefined,
      onReset: () => {
        if (this.service.getStatus() === 'Started')
          this.service.send({ type: FORM_RESET_EVENT } as T['event'])
      },
    })
  }

  hostUpdate(): void {
    // 排在 trackers 之前：重建了就由新机器的 trackers 接着跑
    this.reseed()
    this.runtime?.runTrackers()
  }

  hostDisconnected(): void {
    this.connected = false
    this.formReset?.dispose()
    this.formReset = undefined
    this.runtime?.unmount()
  }
}
