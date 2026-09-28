// @vitest-environment jsdom
// 折叠开关一翻，整栏宽度先按过渡收窄或长开，过渡播完才换成新的排布：
// 这一段里根投影 data-animating，内嵌子层与可见行按旧排布算；没有可等的过渡时即刻换。
import type { SideNavSchema } from '../src/side-nav'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

type Props = SideNavSchema['props']

const COLLECTION = [
  { value: 'products', label: 'Products', children: [{ value: 'product-a', label: 'Product A' }] },
  { value: 'guide', label: 'Guide' },
]

function make(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, defaultExpandedValue: ['products'], ...initial })
  const service = createService(sideNavMachine, { props: () => props.get(), runtime })
  runtime.start()
  const api = () => connectSideNav(service, normalizeProps)
  return {
    root: () => api().getRootProps() as Record<string, unknown>,
    branchHidden: () => (api().getBranchContentProps({ value: 'products' }) as Record<string, unknown>).hidden,
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

/** 让宿主提交与「等过渡播完」的那一轮跑完：jsdom 里没有过渡，即刻落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => setTimeout(resolve, 0))
}

describe('side-nav 折叠的排布落定', () => {
  it('首帧就按折叠开关排布，不经过折叠进行中', () => {
    const nav = make({ collapsed: true })
    expect(nav.root()['data-collapsed']).toBe('')
    expect(nav.root()['data-animating']).toBeUndefined()
    expect(nav.branchHidden()).toBe(true)
  })

  it('折叠：开关翻了先投影 data-animating，内嵌子层仍按平铺展开；落定之后收成图标栏', async () => {
    const nav = make()
    expect(nav.branchHidden()).toBeFalsy()
    nav.setProps({ collapsed: true })
    expect(nav.root()['data-collapsed']).toBe('')
    expect(nav.root()['data-animating']).toBe('')
    expect(nav.branchHidden(), '宽度还在收，子层不先收起').toBeFalsy()
    await settle()
    expect(nav.root()['data-animating']).toBeUndefined()
    expect(nav.branchHidden()).toBe(true)
  })

  it('展开：宽度长开的那一段仍按图标栏排布，落定之后子层才回来', async () => {
    const nav = make({ collapsed: true })
    nav.setProps({ collapsed: false })
    expect(nav.root()['data-collapsed']).toBeUndefined()
    expect(nav.root()['data-animating']).toBe('')
    expect(nav.branchHidden()).toBe(true)
    await settle()
    expect(nav.root()['data-animating']).toBeUndefined()
    expect(nav.branchHidden()).toBeFalsy()
  })

  it('还没落定又翻回去：旧的那一轮落定不作数，排布与开关一致即不再进行中', async () => {
    const nav = make()
    nav.setProps({ collapsed: true })
    nav.setProps({ collapsed: false })
    expect(nav.root()['data-animating']).toBeUndefined()
    await settle()
    expect(nav.root()['data-animating']).toBeUndefined()
    expect(nav.branchHidden()).toBeFalsy()
  })
})
