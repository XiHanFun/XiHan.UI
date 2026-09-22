// @vitest-environment jsdom
// useMachine 的 props 取值器：连接层每读一个 prop 都会走一遍，同一轮渲染里只求值一次。
//
// 记忆的两把钥匙：渲染轮次盖住组件 props 与渲染期赋的 ref，机器版本号盖住从别的机器现读的
// 派生值。两者都没动，展开结果必然一样；任一动了当场作废。
import type { ReactNode } from 'react'
import { buttonMachine, connectButton, toggleMachine } from '@xihan-ui/headless'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { reactNormalize } from '../src/runtime/normalize-props'
import { useMachine } from '../src/runtime/use-machine'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
}

describe('useMachine 的 props 取值器', () => {
  it('一次连接里读十几个 prop 只求值一次，重渲各算一次', async () => {
    let calls = 0
    let bump!: () => void
    let setDisabled!: (next: boolean) => void
    function Probe(): ReactNode {
      const [, setTick] = useState(0)
      const [disabled, setNext] = useState(false)
      bump = () => setTick(n => n + 1)
      setDisabled = setNext
      const service = useMachine(buttonMachine, () => {
        calls++
        return { disabled }
      })
      const api = connectButton(service, reactNormalize)
      return <button {...api.getRootProps() as Record<string, unknown>} />
    }
    await mount(<Probe />)
    // connectButton 一趟就读了 disabled / loading / iconOnly / size / variant / as / type 等十来个
    expect(calls).toBeLessThan(3)

    const afterMount = calls
    await act(async () => bump())
    expect(calls - afterMount).toBeLessThan(3)

    await act(async () => setDisabled(true))
    expect(host!.querySelector('button')!.hasAttribute('disabled')).toBe(true)
  })

  it('别的机器改了状态，记忆当场作废，派生 props 现读得到', async () => {
    let derived = 0
    function Probe(): ReactNode {
      const toggle = useMachine(toggleMachine, () => ({}))
      const button = useMachine(buttonMachine, () => {
        derived++
        // 从另一台机器现读：它的状态在两次渲染之间也会变
        return { disabled: toggle.state.get() === 'on' }
      })
      const api = connectButton(button, reactNormalize)
      return (
        <button
          {...api.getRootProps() as Record<string, unknown>}
          data-toggle={toggle.state.get()}
          onClick={() => toggle.send({ type: 'TOGGLE' })}
        />
      )
    }
    await mount(<Probe />)
    const afterMount = derived
    expect(afterMount).toBeLessThan(3)

    await act(async () => {
      host!.querySelector('button')!.click()
    })
    expect(host!.querySelector('button')!.getAttribute('data-toggle')).toBe('on')
    expect(host!.querySelector('button')!.hasAttribute('disabled')).toBe(true)
  })
})
