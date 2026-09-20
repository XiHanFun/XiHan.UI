// @vitest-environment jsdom
// useMachine 的 start 选项：缺省等 mounted，'setup' 在 setup 里当场 start。
//
// 组件的机器要等节点落定，效应一进初态就读自己的节点；命令式服务宿主的队列机器
// 没有 DOM 锚点，端口在 setup 就接上，机器也得在 setup 就能收命令。
import type { MachineStatus } from '@xihan-ui/core'
import { notificationMachine } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { useMachine } from '../src/runtime/use-machine'

const disposers: Array<() => void> = []

afterEach(() => {
  while (disposers.length)
    disposers.pop()!()
  document.body.innerHTML = ''
})

/** 挂一个组件，记下机器在 setup 末尾与 mounted 后各自的状态。 */
function probe(start?: 'mounted' | 'setup'): { atSetup: MachineStatus, afterMount: MachineStatus } {
  let atSetup: MachineStatus = 'NotStarted'
  let service: { getStatus: () => MachineStatus } | null = null
  const Probe = defineComponent({
    setup() {
      const svc = useMachine(notificationMachine, () => ({}), undefined, start ? { start } : {})
      atSetup = svc.getStatus()
      service = svc
      return () => h('div')
    },
  })
  const holder = document.createElement('div')
  document.body.append(holder)
  const app = createApp(Probe)
  disposers.push(() => app.unmount())
  app.mount(holder)
  return { atSetup, afterMount: service!.getStatus() }
}

describe('useMachine 的 start 选项', () => {
  it('缺省：setup 末尾还没 start，mounted 后才 Started', () => {
    const { atSetup, afterMount } = probe()
    expect(atSetup).toBe('NotStarted')
    expect(afterMount).toBe('Started')
  })

  it('start 为 setup：setup 里当场 Started，mounted 不再重复 start', () => {
    const { atSetup, afterMount } = probe('setup')
    expect(atSetup).toBe('Started')
    expect(afterMount).toBe('Started')
  })

  it('start 为 setup：卸载时照常停机', () => {
    let status: () => MachineStatus = () => 'NotStarted'
    const Probe = defineComponent({
      setup() {
        const svc = useMachine(notificationMachine, () => ({}), undefined, { start: 'setup' })
        status = svc.getStatus
        return () => h('div')
      },
    })
    const holder = document.createElement('div')
    document.body.append(holder)
    const app = createApp(Probe)
    app.mount(holder)
    expect(status()).toBe('Started')
    app.unmount()
    expect(status()).toBe('Stopped')
  })
})
