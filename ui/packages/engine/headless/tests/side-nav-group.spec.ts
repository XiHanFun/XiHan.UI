// @vitest-environment jsdom
// 侧栏分组的列表结构：group 是上一层列表里的一条（li），不挂角色；组内的行挂在 group-list（ul）里，
// 它以同一分组的 group-label 命名。列表项的父节点必须是列表，role=group 放在哪一层都会拆散列表语义。
import type { SideNavNode, SideNavSchema } from '../src/side-nav'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

type Props = SideNavSchema['props']
type Attrs = Record<string, unknown>

const COLLECTION: SideNavNode[] = [
  { value: 'home', label: '工作台', href: '#home' },
  { value: 'users', label: '用户管理', href: '#users' },
]

function make(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, ...initial })
  const service = createService(sideNavMachine, { props: () => props.get(), runtime })
  runtime.start()
  return () => connectSideNav(service, normalizeProps)
}

describe('side-nav 分组结构', () => {
  it('group 不挂角色也不自带可及名：它是上一层列表里的一条', () => {
    const api = make()
    const group = api().getGroupProps({ value: 'main', members: ['home'] }) as Attrs
    expect(group['data-scope']).toBe('side-nav')
    expect(group['data-part']).toBe('group')
    expect(group.role).toBeUndefined()
    expect(group['aria-labelledby']).toBeUndefined()
  })

  it('group-list 不挂 role，以 aria-labelledby 指向同一分组的 group-label', () => {
    const api = make()
    const label = api().getGroupLabelProps({ value: 'main' }) as Attrs
    const list = api().getGroupListProps({ value: 'main' }) as Attrs
    expect(list['data-scope']).toBe('side-nav')
    expect(list['data-part']).toBe('group-list')
    expect(list.role).toBeUndefined()
    expect(typeof label.id).toBe('string')
    expect(list['aria-labelledby']).toBe(label.id)
  })

  it('不同分组各指各的标题', () => {
    const api = make()
    const main = api().getGroupListProps({ value: 'main' }) as Attrs
    const admin = api().getGroupListProps({ value: 'admin' }) as Attrs
    expect(main['aria-labelledby']).not.toBe(admin['aria-labelledby'])
    expect(admin['aria-labelledby']).toBe((api().getGroupLabelProps({ value: 'admin' }) as Attrs).id)
  })
})
