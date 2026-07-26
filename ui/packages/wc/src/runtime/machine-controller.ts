import type { ReactiveController, ReactiveControllerHost } from '@lit/reactive-element'
import type { Scope } from '@xihan-ui/core'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { LitRuntime } from './lit-runtime'
import { createService } from '@xihan-ui/machine'
import { createLitRuntime } from './lit-runtime'

export interface MachineControllerOptions<T extends MachineSchema> {
  scope?: Scope
  /** 每次(重)建机器后回调，用于注入 refs：初次 + 重连重建都会触发。 */
  onBuilt?: (service: Service<T>) => void
}

// 一台机器一个 controller：hostConnected→build+mount、hostUpdate→runTrackers、hostDisconnected→unmount。
// 复用唯一解释器 createService，不重造 FSM。
export class MachineController<T extends MachineSchema> implements ReactiveController {
  service!: Service<T>
  private runtime: LitRuntime | undefined
  private started = false

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly machine: MachineConfig<T>,
    private readonly props: () => Partial<T['props']>,
    private readonly opts: MachineControllerOptions<T> = {},
  ) {
    host.addController(this)
    // 刻意不在构造期 build：此刻 attribute 尚未反射到 reactive property，
    // initialState 会读到 undefined（如 default-checked / default-open 失效）。延到 hostConnected。
  }

  private build(): void {
    this.runtime = createLitRuntime(this.host)
    this.service = createService(this.machine, { props: this.props, runtime: this.runtime, scope: this.opts.scope })
    this.opts.onBuilt?.(this.service)
  }

  hostConnected(): void {
    // 首次连接时 attribute 已反射到 property，initialState 读得到；
    // 重连（元素在 DOM 中被移动）时旧机器 stop 不可复活 → 重建从 initialState 起（状态不跨移动保留）。
    if (!this.started || this.service.getStatus() === 'Stopped') {
      this.build()
      this.started = true
    }
    this.runtime!.mount()
  }

  hostUpdate(): void {
    this.runtime?.runTrackers()
  }

  hostDisconnected(): void {
    this.runtime?.unmount()
  }
}
