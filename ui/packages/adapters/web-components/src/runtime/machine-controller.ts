import type { Scope } from '@xihan-ui/kernel'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { ReactiveController, ReactiveControllerHost } from '../reactive'
import type { LitRuntime } from './lit-runtime'
import { createService } from '@xihan-ui/machine'
import { createLitRuntime } from './lit-runtime'

export interface MachineControllerOptions<T extends MachineSchema> {
  scope?: Scope
  /** 每次建机器后回调，用于注入 refs。 */
  onBuilt?: (service: Service<T>) => void
}

// 一台机器一个 controller：hostConnected 建机器并 mount、hostUpdate 跑 trackers、hostDisconnected unmount。
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
    // 延到 hostConnected 再 build，构造期 attribute 尚未反射到 reactive property。
  }

  private build(): void {
    this.runtime = createLitRuntime(this.host)
    this.service = createService(this.machine, { props: this.props, runtime: this.runtime, scope: this.opts.scope })
    this.opts.onBuilt?.(this.service)
  }

  hostConnected(): void {
    // 首次或旧机器已停止时重建，从 initialState 起。
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
