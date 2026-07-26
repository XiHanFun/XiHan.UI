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

// 一台机器一个 controller：hostConnected→mount、hostUpdate→runTrackers、hostDisconnected→unmount。
// 复用唯一解释器 createService，不重造 FSM。
export class MachineController<T extends MachineSchema> implements ReactiveController {
  service: Service<T>
  private runtime: LitRuntime

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly machine: MachineConfig<T>,
    private readonly props: () => Partial<T['props']>,
    private readonly opts: MachineControllerOptions<T> = {},
  ) {
    const built = this.build()
    this.service = built.service
    this.runtime = built.runtime
    host.addController(this)
  }

  private build(): { service: Service<T>, runtime: LitRuntime } {
    const runtime = createLitRuntime(this.host)
    const service = createService(this.machine, { props: this.props, runtime, scope: this.opts.scope })
    this.opts.onBuilt?.(service)
    return { service, runtime }
  }

  hostConnected(): void {
    // 重连（元素在 DOM 中被移动）：解释器 stop 后不可复活，重建一台从 initialState 起。
    // 状态不跨移动保留、context 一并重置——符合 W2 的"再装配"语义。
    if (this.service.getStatus() === 'Stopped') {
      const built = this.build()
      this.service = built.service
      this.runtime = built.runtime
    }
    this.runtime.mount()
  }

  hostUpdate(): void {
    this.runtime.runTrackers()
  }

  hostDisconnected(): void {
    this.runtime.unmount()
  }
}
