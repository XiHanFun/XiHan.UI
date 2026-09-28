// @vitest-environment jsdom
// 侧栏搜索：输入即按标签过滤导航树，命中入口的祖先保留并展开，未命中的收起；
// 搜索里的展开单独记，不改写作者的展开状态，清空即回到原样；落成图标栏时过滤暂停。
import type { SideNavNode, SideNavSchema } from '../src/side-nav'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { filterTreeNodes, matchTreeNodeLabel } from '../src/shared/tree-search'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

type Props = SideNavSchema['props']
type Attrs = Record<string, unknown>

const COLLECTION: SideNavNode[] = [
  { value: 'home', label: '工作台', href: '#home' },
  {
    value: 'user',
    label: '用户管理',
    children: [
      { value: 'user-list', label: '用户列表', href: '#user-list' },
      { value: 'user-role', label: '角色权限', href: '#user-role' },
    ],
  },
  {
    value: 'order',
    label: '订单管理',
    children: [
      { value: 'order-list', label: '订单列表', href: '#order-list' },
      {
        value: 'order-after',
        label: '售后',
        children: [{ value: 'order-refund', label: '退款处理', href: '#order-refund' }],
      },
    ],
  },
]

function make(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, ...initial })
  const service = createService(sideNavMachine, { props: () => props.get(), runtime })
  runtime.start()
  const api = () => connectSideNav(service, normalizeProps)
  return {
    api,
    type: (text: string) => api().setInputValue(text),
    item: (value: string) => api().getItemProps({ value }) as Attrs,
    branch: (value: string) => api().getBranchProps({ value }) as Attrs,
    content: (value: string) => api().getBranchContentProps({ value }) as Attrs,
    trigger: (value: string) => api().getBranchTriggerProps({ value }) as Attrs,
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

/** 让宿主提交与「等过渡播完」的那一轮跑完：jsdom 里没有过渡，即刻落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => setTimeout(resolve, 0))
}

describe('side-nav 搜索', () => {
  it('输入检索词：没命中的叶子与整枝收起，命中入口的祖先保留并展开', () => {
    const nav = make()
    nav.type('退款')
    expect(nav.api().searching).toBe(true)
    expect(nav.item('home').hidden, '没命中的叶子整行收起').toBe(true)
    expect(nav.branch('user').hidden, '子孙一个没命中的分支整枝收起').toBe(true)
    expect(nav.branch('order').hidden).toBeUndefined()
    expect(nav.branch('order-after').hidden).toBeUndefined()
    expect(nav.item('order-refund').hidden).toBeUndefined()
    expect(nav.item('order-list').hidden, '命中的祖先只留命中的那几枝').toBe(true)
    // 祖先一路展开，命中的那一条一眼就看得到
    expect(nav.trigger('order')['aria-expanded']).toBe('true')
    expect(nav.trigger('order-after')['aria-expanded']).toBe('true')
    expect(nav.content('order').hidden).toBeUndefined()
    expect(nav.content('order-after').hidden).toBeUndefined()
  })

  it('命中的分支整枝留下，子节点照常在里面，分支本身不因命中而自动展开', () => {
    const nav = make()
    nav.type('订单管理')
    expect(nav.branch('order').hidden).toBeUndefined()
    expect(nav.item('order-list').hidden).toBeUndefined()
    expect(nav.branch('order-after').hidden).toBeUndefined()
    expect(nav.trigger('order')['aria-expanded']).toBe('false')
  })

  it('匹配大小写不敏感，检索词两端的空白不算；空白串不进搜索视图', () => {
    const nav = make({ collection: [{ value: 'a', label: 'Dashboard' }, { value: 'b', label: 'Orders' }] })
    nav.type('  DASH ')
    expect(nav.item('a').hidden).toBeUndefined()
    expect(nav.item('b').hidden).toBe(true)
    nav.type('   ')
    expect(nav.api().searching).toBe(false)
    expect(nav.item('b').hidden).toBeUndefined()
  })

  it('没传 label 时按 value 匹配', () => {
    const nav = make({ collection: [{ value: 'settings' }, { value: 'logs' }] })
    nav.type('set')
    expect(nav.item('settings').hidden).toBeUndefined()
    expect(nav.item('logs').hidden).toBe(true)
  })

  it('filter 自定义匹配规则：检索词交给它判定每一条入口', () => {
    const filter = vi.fn((node: SideNavNode, query: string) => node.value.startsWith(query))
    const nav = make({ filter })
    nav.type('order-r')
    expect(nav.item('order-refund').hidden).toBeUndefined()
    expect(nav.item('order-list').hidden).toBe(true)
    expect(nav.item('home').hidden).toBe(true)
    expect(filter).toHaveBeenCalledWith(expect.objectContaining({ value: 'home' }), 'order-r')
  })

  it('搜索里的展开收起只记在搜索视图里，不改写作者的展开状态，也不发通知；清空检索词回到原样', () => {
    const onExpandedValueChange = vi.fn()
    const nav = make({ defaultExpandedValue: ['user'], onExpandedValueChange })
    nav.type('退款')
    expect(nav.api().expandedValue).toEqual(['user'])
    nav.api().collapse('order')
    expect(nav.trigger('order')['aria-expanded']).toBe('false')
    nav.api().expand('order')
    expect(nav.trigger('order')['aria-expanded']).toBe('true')
    expect(onExpandedValueChange).not.toHaveBeenCalled()
    expect(nav.api().expandedValue).toEqual(['user'])

    nav.type('')
    expect(nav.api().searching).toBe(false)
    expect(nav.trigger('user')['aria-expanded']).toBe('true')
    expect(nav.trigger('order')['aria-expanded'], '搜索里的展开不带回整棵树').toBe('false')
    expect(nav.item('home').hidden).toBeUndefined()
  })

  it('换一次检索词，搜索视图的展开集合按新词重置', () => {
    const nav = make()
    nav.type('退款')
    nav.api().collapse('order')
    nav.type('退款处')
    expect(nav.trigger('order')['aria-expanded']).toBe('true')
  })

  it('accordion 只管作者的展开：搜索视图里命中的几枝同时摊开', () => {
    const nav = make({ accordion: true })
    nav.type('列表')
    expect(nav.trigger('user')['aria-expanded']).toBe('true')
    expect(nav.trigger('order')['aria-expanded']).toBe('true')
  })

  it('一条都没命中：empty 为真，空态露面并以 status 播报；其余时候空态带 hidden', () => {
    const nav = make()
    const emptyProps = () => nav.api().getEmptyProps() as Attrs
    expect(nav.api().empty).toBe(false)
    expect(emptyProps().hidden).toBe(true)
    nav.type('zzz')
    expect(nav.api().empty).toBe(true)
    expect(emptyProps().hidden).toBeUndefined()
    expect(emptyProps().role).toBe('status')
    expect(nav.api().translations.noMatch).toBe('No matches')
  })

  it('分组：一个成员都没命中就整组收起；不在搜索里或没报成员时不藏', () => {
    const nav = make()
    const group = (members?: readonly string[]) => nav.api().getGroupProps({ value: 'g', members }) as Attrs
    expect(group(['home']).hidden).toBeUndefined()
    nav.type('订单')
    expect(group(['home']).hidden).toBe(true)
    expect(group(['home', 'order']).hidden).toBeUndefined()
    expect(group().hidden).toBeUndefined()
  })

  it('列表项没报身份时不藏', () => {
    const nav = make()
    nav.type('退款')
    expect((nav.api().getItemProps() as Attrs).hidden).toBeUndefined()
  })

  it('搜索框：带可及名、指着 list、投影字段家族的输入标记；翻译可覆盖', () => {
    const nav = make({ translations: { input: '搜索导航' } })
    const input = nav.api().getInputProps() as Attrs
    const list = nav.api().getListProps() as Attrs
    expect(input['aria-label']).toBe('搜索导航')
    expect(input['aria-controls']).toBe(list.id)
    expect(input['data-xh-field-input']).toBe('')
    expect(input.type).toBe('text')
    expect(input.value).toBe('')
    nav.type('用户')
    expect((nav.api().getInputProps() as Attrs).value).toBe('用户')
  })

  it('整个侧栏禁用：搜索框原生禁用', () => {
    const nav = make({ disabled: true })
    const input = nav.api().getInputProps() as Attrs
    expect(input.disabled).toBe(true)
    expect(input['data-disabled']).toBe('')
  })

  it('落成图标栏时过滤暂停，检索词照留；展开落定之后接着按原词过滤', async () => {
    const nav = make()
    nav.type('退款')
    nav.setProps({ collapsed: true })
    await settle()
    expect(nav.api().searching).toBe(false)
    expect(nav.item('home').hidden, '图标栏里一条都不藏').toBeUndefined()
    expect(nav.api().inputValue).toBe('退款')
    nav.setProps({ collapsed: false })
    await settle()
    expect(nav.api().searching).toBe(true)
    expect(nav.item('home').hidden).toBe(true)
  })

  it('搜索框里 Escape：词非空时清词并拦下默认行为，词已空时放行', () => {
    const nav = make()
    nav.type('退款')
    const keydown = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      ;(nav.api().getInputProps() as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(event)
      return event
    }
    expect(keydown('Escape').defaultPrevented).toBe(true)
    expect(nav.api().inputValue).toBe('')
    expect(keydown('Escape').defaultPrevented).toBe(false)
  })

  it('搜索框里输入法组合期间的按键一律不接', () => {
    const nav = make()
    nav.type('退款')
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, isComposing: true })
    ;(nav.api().getInputProps() as { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(event)
    expect(nav.api().inputValue).toBe('退款')
  })
})

describe('树形检索裁剪（TreeSelect 与 SideNav 共用）', () => {
  it('命中的节点整枝留下；没命中的分支只留命中的那几枝并记为展开；一枝都不剩的去掉', () => {
    const view = filterTreeNodes(COLLECTION, '退款', matchTreeNodeLabel)
    expect(view.nodes.map(node => node.value)).toEqual(['order'])
    expect(view.nodes[0]!.children!.map(node => node.value)).toEqual(['order-after'])
    expect(view.expanded).toEqual(['order-after', 'order'])
    const whole = filterTreeNodes(COLLECTION, '订单管理', matchTreeNodeLabel)
    expect(whole.nodes[0]).toBe(COLLECTION[2])
    expect(whole.expanded).toEqual([])
  })

  it('检索词里的正则元字符按字面比对', () => {
    const view = filterTreeNodes([{ value: 'a', label: 'a.b' }, { value: 'b', label: 'axb' }], '.', matchTreeNodeLabel)
    expect(view.nodes.map(node => node.value)).toEqual(['a'])
  })
})
