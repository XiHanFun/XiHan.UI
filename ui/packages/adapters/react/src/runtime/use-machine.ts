import type { MachineConfig, MachineSchema, Service, ServiceOptions } from '@xihan-ui/core'
import type { ReactRuntime } from './create-react-runtime'
import { VERSION as CORE_VERSION, createService, isDev } from '@xihan-ui/core'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/core/metadata'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { version as REACT_ADAPTER_VERSION } from '../../package.json'
import { applyXhConfigDefaults, useXhConfigDefaults } from './config-defaults'
import { createReactRuntime } from './create-react-runtime'

// 一台机器一个 hook 实例：渲染体登记最新 props，提交后挂载机器、跑 trackers，
// 状态变化经 useSyncExternalStore 拉回组件重渲。

// 锁步版本检查只跑一次：第一个组件建机器时借路启动，之后的组件全走这个开关。
// 生产构建里 isDev() 为 false，跳过。
let devChecksStarted = false

function ensureDevChecks(): void {
  if (devChecksStarted)
    return
  devChecksStarted = true
  // 宿主登记不分 dev/prod：元数据要能报出运行在哪个适配器上
  registerRuntimeHost('react', REACT_ADAPTER_VERSION)
  if (isDev()) {
    checkLockstepVersion('react', REACT_ADAPTER_VERSION, CORE_VERSION)
    printMetadataBannerOnce()
  }
}

// 服务端渲染没有提交，layout effect 换成永不执行的 useEffect，避开 React 的警告
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 服务端快照恒为初始版本号，与客户端首帧对齐。 */
function getServerVersion(): number {
  return 0
}

interface Instance<T extends MachineSchema> {
  runtime: ReactRuntime
  /** 身份稳定的对外句柄，内部机器换了也不用换引用。 */
  facade: Service<T>
  mount: () => void
  unmount: () => void
}

function createInstance<T extends MachineSchema>(
  machine: MachineConfig<T>,
  props: ServiceOptions<T>['props'],
): Instance<T> {
  const runtime = createReactRuntime()
  let service = createService(machine, { props, runtime })

  const facade: Service<T> = {
    get machine() {
      return service.machine
    },
    get getStatus() {
      return service.getStatus
    },
    get state() {
      return service.state
    },
    get context() {
      return service.context
    },
    get refs() {
      return service.refs
    },
    get computed() {
      return service.computed
    },
    get prop() {
      return service.prop
    },
    get event() {
      return service.event
    },
    get scope() {
      return service.scope
    },
    get send() {
      return service.send
    },
  }

  return {
    runtime,
    facade,
    mount() {
      // 上一轮已停机（StrictMode 的 mount→cleanup→mount 会走到这里）就整台重建：
      // 停机后的 service 会静默丢弃一切事件，且状态与上下文只能一起回到初始才不分叉
      if (service.getStatus() === 'Stopped') {
        runtime.reset()
        service = createService(machine, { props, runtime })
        runtime.mount()
        runtime.notify()
        return
      }
      runtime.mount()
    },
    unmount() {
      runtime.unmount()
    },
  }
}

/** getProps 每次调用都要返回宿主此刻最新的 props。 */
export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  getProps: () => Partial<T['props']>,
): Service<T> {
  ensureDevChecks()

  // 渲染体就换上这一帧的取值器：service 的 props() 调用极频繁，读到的必须是最新那一份
  const propsRef = useRef(getProps)
  propsRef.current = getProps

  // 全局配置在这一处并进来：所有跑机器的组件都从这里取 props，不必逐个接线。
  // 与 WC 侧 MachineController 里那一处对位，三个适配器的生效面因此一致
  const getConfig = useXhConfigDefaults()
  const configRef = useRef(getConfig)
  configRef.current = getConfig

  const [instance] = useState<Instance<T>>(() => createInstance<T>(
    machine,
    (() => applyXhConfigDefaults(
      machine.name,
      { ...propsRef.current() },
      configRef.current(),
    )) as ServiceOptions<T>['props'],
  ))
  const { runtime } = instance

  // 标记「此刻在渲染中」并记下这次渲染读到的版本号：
  // 前者让这期间发起的 flush 绕开 flushSync，后者让提交后的 flush 判断 DOM 是否还欠一轮。
  // 必须排在 useSyncExternalStore 之前，两处读到的是同一个版本号
  runtime.beginRender()

  useSyncExternalStore(runtime.subscribe, runtime.getVersion, getServerVersion)

  useIsomorphicLayoutEffect(() => {
    instance.mount()
    return () => instance.unmount()
  }, [instance])

  // 不给依赖数组：每次提交后都跑。
  // 先跑这一轮排队的 flush 回调（此刻 DOM 刚落定），再拉一遍 tracker 的依赖——
  // 反过来的话，tracker 触发的转移排出来的回调会在它那次变更提交之前就跑掉
  useIsomorphicLayoutEffect(() => {
    runtime.flushCommitted()
    runtime.runTrackers()
  })

  return instance.facade
}
