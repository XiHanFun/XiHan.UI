import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/core'
import type { DisclosureSchema } from './disclosure-machine'
import { act, StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDisclosureMachine } from './disclosure-machine'

/** 每个候选实现要交的那一个口子。 */
export type UseMachineFn = <T extends MachineSchema>(
  machine: MachineConfig<T>,
  getProps: () => Partial<T['props']>,
) => Service<T>

type Props = Partial<DisclosureSchema['props']>

let container: HTMLElement
let root: ReturnType<typeof createRoot>

/** 卸掉当前这棵树，换个容器重新挂——机器跟着重建。 */
function remount(node: React.ReactNode, strict = false): void {
  act(() => root.unmount())
  container.remove()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  mount(node, strict)
}

/** 往当前这棵树上渲染。同类型同位置的重渲不会重建机器。 */
function mount(node: React.ReactNode, strict = false): void {
  act(() => {
    root.render(strict ? <StrictMode>{node}</StrictMode> : node)
  })
}

/**
 * 三个候选实现共用的判据。
 *
 * 每一条都对着一种具体的写错方式：推式 track 看不见 props 变化、
 * flush 排在提交之前拿到旧 DOM、受控判定被首帧闭包冻住、双挂载留下分叉态。
 */
export function describeRuntimeContract(name: string, useMachine: UseMachineFn): void {
  describe(`运行时接缝契约（${name}）`, () => {
    beforeEach(() => {
      container = document.createElement('div')
      document.body.append(container)
      root = createRoot(container)
      ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    })

    afterEach(() => {
      act(() => root.unmount())
      container.remove()
    })

    /** 开合件：内容节点只在展开态渲染，展开态的 entry 会做一次提交后探测。 */
    function Disclosure(props: Props & {
      serviceRef?: (s: Service<DisclosureSchema>) => void
      autoOpen?: boolean
    }): React.ReactNode {
      const [machine] = useState(() => createDisclosureMachine())
      const service = useMachine<DisclosureSchema>(machine, () => props)
      props.serviceRef?.(service)
      useEffect(() => {
        if (props.autoOpen)
          service.send({ type: 'OPEN' })
      }, [service, props.autoOpen])
      const open = service.state.get() === 'open'
      return (
        <div>
          <button data-testid="trigger" type="button" onClick={() => service.send({ type: 'TOGGLE' })}>
            {props.label ?? 't'}
          </button>
          {open ? <div data-testid="content" /> : null}
        </div>
      )
    }

    const trigger = (): HTMLElement => container.querySelector<HTMLElement>('[data-testid="trigger"]')!
    const content = (): HTMLElement | null => container.querySelector<HTMLElement>('[data-testid="content"]')

    it('挂载即接上：初态、context、渲染三者一致', () => {
      mount(<Disclosure />)
      expect(content()).toBeNull()
      remount(<Disclosure defaultOpen />)
      expect(content()).not.toBeNull()
    })

    it('send 之后组件重渲', () => {
      mount(<Disclosure />)
      act(() => trigger().click())
      expect(content()).not.toBeNull()
      act(() => trigger().click())
      expect(content()).toBeNull()
    })

    // —— flush：全案最容易写错的一格 ——

    it('flush 在 React 事件里触发时也跑在提交之后', () => {
      const seen: { content: boolean, hidden: boolean | null }[] = []
      mount(<Disclosure onAfterCommit={s => seen.push(s)} />)
      act(() => trigger().click())
      expect(seen).toHaveLength(1)
      // 排在提交之前的实现在这里拿到的是 content:false——那一刻节点还没挂上
      expect(seen[0]!.content).toBe(true)
    })

    it('flush 在 React 事件之外触发时也跑在提交之后', () => {
      const seen: { content: boolean, hidden: boolean | null }[] = []
      let service!: Service<DisclosureSchema>
      mount(<Disclosure onAfterCommit={s => seen.push(s)} serviceRef={s => (service = s)} />)
      // 不经过任何 React 事件：并发调度下这次更新不是同步提交的
      act(() => service.send({ type: 'OPEN' }))
      expect(seen).toHaveLength(1)
      expect(seen[0]!.content).toBe(true)
    })

    it('flush 回调在卸载之后不再跑', () => {
      const seen: unknown[] = []
      let service!: Service<DisclosureSchema>
      mount(<Disclosure onAfterCommit={s => seen.push(s)} serviceRef={s => (service = s)} />)
      act(() => {
        service.send({ type: 'OPEN' })
        root.unmount()
      })
      expect(seen).toHaveLength(0)
    })

    it('消费方在自己的 effect 里 send，flush 仍跑在提交之后且不触发 React 警告', () => {
      const seen: { content: boolean, hidden: boolean | null }[] = []
      const errors: unknown[][] = []
      const original = console.error
      console.error = (...args: unknown[]) => void errors.push(args)
      try {
        mount(<Disclosure autoOpen onAfterCommit={s => seen.push(s)} />)
      }
      finally {
        console.error = original
      }
      expect(seen).toHaveLength(1)
      expect(seen[0]!.content).toBe(true)
      expect(errors).toEqual([])
    })

    it('flush 回调里再 send，第二次转移的探测也在它自己那次提交之后', () => {
      const seen: { content: boolean, hidden: boolean | null }[] = []
      let service!: Service<DisclosureSchema>
      let once = false
      mount(
        <Disclosure
          serviceRef={s => (service = s)}
          onAfterCommit={(s) => {
            seen.push(s)
            if (!once) {
              once = true
              service.send({ type: 'CLOSE' })
            }
          }}
        />,
      )
      act(() => service.send({ type: 'OPEN' }))
      // 关回去之后内容节点该没了；连锁转移不许把探测留在旧 DOM 上
      expect(seen[0]!.content).toBe(true)
      expect(content()).toBeNull()
    })

    // —— track：拉式还是推式，这一条会把推式实现打红 ——

    it('track 看得见只在 props 上变的值', () => {
      const seen: (string | undefined)[] = []
      mount(<Disclosure label="a" onLabelSeen={l => seen.push(l)} />)
      seen.length = 0
      mount(<Disclosure label="b" onLabelSeen={l => seen.push(l)} />)
      // label 不经过任何 cell.set，推式 track 在这里一次都不会响
      expect(seen).toEqual(['b'])
    })

    it('track 在值没变时不响', () => {
      const seen: (string | undefined)[] = []
      mount(<Disclosure label="a" onLabelSeen={l => seen.push(l)} />)
      seen.length = 0
      mount(<Disclosure label="a" onLabelSeen={l => seen.push(l)} />)
      expect(seen).toEqual([])
    })

    // —— 受控：判定必须每次现读，不能冻在首帧 ——

    it('受控时 send 不自改 DOM，只发意图', () => {
      const changes: boolean[] = []
      mount(<Disclosure open={false} onOpenChange={v => changes.push(v)} />)
      act(() => trigger().click())
      expect(content()).toBeNull()
      expect(changes).toEqual([true])
    })

    it('受控值由父写回后才生效', () => {
      mount(<Disclosure open={false} />)
      mount(<Disclosure open />)
      expect(content()).not.toBeNull()
    })

    it('受控判定现读：首帧非受控、后续转受控也认', () => {
      const changes: boolean[] = []
      mount(<Disclosure onOpenChange={v => changes.push(v)} />)
      // 转成受控且钉在关闭
      mount(<Disclosure open={false} onOpenChange={v => changes.push(v)} />)
      changes.length = 0
      act(() => trigger().click())
      expect(content()).toBeNull()
      expect(changes).toEqual([true])
    })

    // —— 挂载钩子与重挂载 ——

    it('挂载钩子每次挂载各跑一次，卸载时清理', () => {
      let mounted = 0
      let cleaned = 0
      mount(<Disclosure onMounted={() => (mounted += 1)} onCleaned={() => (cleaned += 1)} />)
      expect(mounted).toBe(1)
      expect(cleaned).toBe(0)
      act(() => root.unmount())
      expect(cleaned).toBe(1)
    })

    it('StrictMode 双挂载之后状态与上下文不分叉，且还能收事件', () => {
      mount(<Disclosure />, true)
      expect(content()).toBeNull()
      act(() => trigger().click())
      expect(content()).not.toBeNull()
      act(() => trigger().click())
      expect(content()).toBeNull()
    })

    it('StrictMode 下 defaultOpen 仍然是展开态', () => {
      mount(<Disclosure defaultOpen />, true)
      expect(content()).not.toBeNull()
    })

    it('StrictMode 下消费方 effect 里的 send 不被那一轮重挂载吞掉', () => {
      const seen: { content: boolean, hidden: boolean | null }[] = []
      mount(<Disclosure autoOpen onAfterCommit={s => seen.push(s)} />, true)
      // 双挂载会把第一轮丢掉，第二轮的 effect 必须把它重新送达
      expect(content()).not.toBeNull()
      expect(seen.length).toBeGreaterThanOrEqual(1)
      expect(seen.at(-1)!.content).toBe(true)
    })

    it('StrictMode 下受控组件不会自己动', () => {
      const changes: boolean[] = []
      mount(<Disclosure open={false} onOpenChange={v => changes.push(v)} />, true)
      expect(content()).toBeNull()
      expect(changes).toEqual([])
    })

    it('两棵树互不串扰', () => {
      function Pair(): React.ReactNode {
        return (
          <>
            <Disclosure defaultOpen />
            <Disclosure />
          </>
        )
      }
      mount(<Pair />)
      expect(container.querySelectorAll('[data-testid="content"]')).toHaveLength(1)
    })
  })
}
