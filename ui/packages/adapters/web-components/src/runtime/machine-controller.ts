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

// 一台机器一个 controller：hostConnected 建机器并 mount、hostUpdate 跑 trackers、hostDisconnected unmount。
export class MachineController<T extends MachineSchema> implements ReactiveController {
  service!: Service<T>
  private runtime: LitRuntime | undefined
  private started = false
  private formReset: Disposable | undefined

  private readonly props: () => Partial<T['props']>
  /** 缓存的配置解析结果与它对应的代号。 */
  private resolved: XhConfig | undefined
  private resolvedAt = -1

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly machine: MachineConfig<T>,
    props: () => Partial<T['props']>,
    private readonly opts: MachineControllerOptions<T> = {},
  ) {
    // 全局配置在这一处并进来：所有跑机器的元素都从这里取 props，不必逐个接线。
    // 传宿主元素而不是只看全局那份：配置沿 DOM 祖先链解析，作者用 <xh-config> 包住一棵子树即可局部覆盖
    const bucket = this.opts.configName ?? machine.name
    this.props = () => withXhConfigBase(bucket, props(), this.config())
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
    this.opts.onBuilt?.(this.service)
  }

  hostConnected(): void {
    // 换过位置就是换了一条祖先链，缓存的配置作废；首次接上也从这里起算
    this.resolved = undefined
    // 首次或旧机器已停止时重建，从 initialState 起。
    if (!this.started || this.service.getStatus() === 'Stopped') {
      this.build()
      this.started = true
    }
    this.runtime!.mount()
    // 必须在 mount 之后：桥一挂就可能送事件进来，而 mount 之前送会撞上 SEND_BEFORE_MOUNT
    this.attachFormReset()
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
    this.runtime?.runTrackers()
  }

  hostDisconnected(): void {
    this.formReset?.dispose()
    this.formReset = undefined
    this.runtime?.unmount()
  }
}
