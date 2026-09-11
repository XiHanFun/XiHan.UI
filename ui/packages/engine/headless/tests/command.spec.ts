import type { CommandInputValueChangeDetails, CommandOpenChangeDetails, CommandSchema, CommandSelectDetails } from '../src/command'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  COMMAND_UNGROUPED,
  commandMachine,
  connectCommand,
  flattenCommandGroups,
  navigateCommandResults,
  normalizeCommandQuery,
  resolveCommandGroups,
  resolveCommandNode,
} from '../src/command'

type Props = CommandSchema['props']

const COLLECTION = [
  { value: 'users', label: '用户管理', keywords: ['users'], group: 'nav' },
  { value: 'roles', label: '角色管理', group: 'nav', disabled: true },
  { value: 'export', label: '导出报表', keywords: ['export', 'report'] },
]

const GROUPS = [{ value: 'nav', label: '页面' }]

/** props 走 signal 而不是裸对象：改 prop 要真的惊动 watch，才验得到受控回写那一路。 */
function makeCommand(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ collection: COLLECTION, groups: GROUPS, ...initial })
  const service = createService(commandMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectCommand(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 输入框的 onInput 只读 event.target.value，node 环境里没有 Event，喂个最小形状即可。 */
function type(props: { onInput?: unknown }, value: string): void {
  (props.onInput as (e: { target: { value: string } }) => void)({ target: { value } })
}

/** Node 测试不依赖原生 KeyboardEvent；连接层只读取这些字段。 */
function key(props: { onKeyDown?: unknown }, value: string): void {
  (props.onKeyDown as (event: Record<string, unknown>) => void)({
    key: value,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    repeat: false,
    preventDefault() {},
  })
}

// ── 过滤：纯函数那一层 ──

describe('命令清单的过滤与归组', () => {
  it('检索串按空白切词，空片段丢掉', () => {
    expect(normalizeCommandQuery('  导出  报表 ')).toEqual(['导出', '报表'])
    expect(normalizeCommandQuery('   ')).toEqual([])
  })

  it('条目补齐缺省值：标题退回 value，别名恒为数组，没归组即空串', () => {
    expect(resolveCommandNode({ value: 'x' })).toEqual({
      value: 'x',
      label: 'x',
      keywords: [],
      group: COMMAND_UNGROUPED,
      disabled: false,
    })
  })

  it('别名与分组名一并参与匹配，逐词都要命中', () => {
    const hit = (query: string): string[] =>
      flattenCommandGroups(resolveCommandGroups(COLLECTION, GROUPS, query, { filter: true, caseSensitive: false }))
        .map(node => node.value)

    // 标题命中
    expect(hit('导出')).toEqual(['export'])
    // 别名命中，且大小写不敏感
    expect(hit('REPORT')).toEqual(['export'])
    // 分组名命中，整组都留下
    expect(hit('页面')).toEqual(['users', 'roles'])
    // 两个词分别落在标题与别名上，顺序不限
    expect(hit('管理 users')).toEqual(['users'])
    expect(hit('users 管理')).toEqual(['users'])
    expect(hit('没有这条')).toEqual([])
  })

  it('区分大小写时别名要逐字对上', () => {
    const strict = (query: string): string[] =>
      flattenCommandGroups(resolveCommandGroups(COLLECTION, GROUPS, query, { filter: true, caseSensitive: true }))
        .map(node => node.value)
    expect(strict('export')).toEqual(['export'])
    expect(strict('EXPORT')).toEqual([])
  })

  it('空组丢掉；组序按 groups 声明，声明之外的排在后面', () => {
    const groups = resolveCommandGroups(COLLECTION, GROUPS, '导出', { filter: true, caseSensitive: false })
    // nav 一条都没剩下，整组不出现
    expect(groups.map(g => g.value)).toEqual([COMMAND_UNGROUPED])

    const all = resolveCommandGroups(COLLECTION, GROUPS, '', { filter: true, caseSensitive: false })
    expect(all.map(g => g.value)).toEqual(['nav', COMMAND_UNGROUPED])
    expect(all[0]!.label).toBe('页面')
  })

  it('关掉过滤即整份清单原样归组，检索串不参与', () => {
    const groups = resolveCommandGroups(COLLECTION, GROUPS, '没有这条', { filter: false, caseSensitive: false })
    expect(flattenCommandGroups(groups).map(n => n.value)).toEqual(['users', 'roles', 'export'])
  })
})

describe('方向键在结果里挑落点', () => {
  const results = flattenCommandGroups(
    resolveCommandGroups(COLLECTION, GROUPS, '', { filter: true, caseSensitive: false }),
  )

  it('禁用的那条跳过：首末与前后都不落在它身上', () => {
    expect(navigateCommandResults(results, null, 'first', true)?.value).toBe('users')
    expect(navigateCommandResults(results, null, 'last', true)?.value).toBe('export')
    expect(navigateCommandResults(results, 'users', 'next', true)?.value).toBe('export')
    expect(navigateCommandResults(results, 'export', 'prev', true)?.value).toBe('users')
  })

  it('锚点不在可用结果里：往下从头起，往上从尾起', () => {
    expect(navigateCommandResults(results, 'roles', 'next', true)?.value).toBe('users')
    expect(navigateCommandResults(results, 'roles', 'prev', true)?.value).toBe('export')
  })

  it('loop 决定走到尽头回不回绕', () => {
    expect(navigateCommandResults(results, 'export', 'next', true)?.value).toBe('users')
    expect(navigateCommandResults(results, 'export', 'next', false)?.value).toBe('export')
    expect(navigateCommandResults(results, 'users', 'prev', false)?.value).toBe('users')
  })

  it('一条可用的都没有即无落点', () => {
    expect(navigateCommandResults([], null, 'first', true)).toBeNull()
    expect(navigateCommandResults(
      [{ value: 'a', label: 'a', keywords: [], group: '', disabled: true }],
      null,
      'first',
      true,
    )).toBeNull()
  })
})

// ── 机器 ──

describe('commandMachine 起步状态', () => {
  it('什么都不给即收起；defaultOpen 起步展开；open 压过 defaultOpen', () => {
    expect(makeCommand().state()).toBe('closed')
    expect(makeCommand({ defaultOpen: true }).state()).toBe('open')
    expect(makeCommand({ open: false, defaultOpen: true }).state()).toBe('closed')
  })

  it('展开即把锚点落在首条可用命令上，禁用的那条不认', () => {
    expect(makeCommand({ defaultOpen: true }).api().highlightedValue).toBe('users')
  })
})

describe('commandMachine 非受控', () => {
  it('打字即改结果，锚点跟着钉回首条命中项', () => {
    const c = makeCommand({ defaultOpen: true })
    type(c.api().getInputProps(), '导出')
    expect(c.api().inputValue).toBe('导出')
    expect(c.api().results.map(n => n.value)).toEqual(['export'])
    expect(c.api().highlightedValue).toBe('export')
  })

  it('一条都没命中：结果为空、锚点摘掉、空态成立', () => {
    const c = makeCommand({ defaultOpen: true })
    type(c.api().getInputProps(), '没有这条命令')
    expect(c.api().results).toEqual([])
    expect(c.api().highlightedValue).toBeNull()
    expect(c.api().empty).toBe(true)
  })

  it('没给清单时整套过滤让开：不判空态', () => {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<Props>({ defaultOpen: true })
    const service = createService(commandMachine, { props: () => props.get(), runtime })
    runtime.start()
    expect(connectCommand(service, normalizeProps).empty).toBe(false)
  })

  it('每次重开都从空检索串起步，上一次打的字不留到下一次', () => {
    const c = makeCommand({ defaultOpen: true })
    type(c.api().getInputProps(), '导出')
    c.api().setOpen(false)
    expect(c.state()).toBe('closed')
    c.api().setOpen(true)
    expect(c.api().inputValue).toBe('')
    expect(c.api().highlightedValue).toBe('users')
  })

  it('选中命令：发一次 select 并收起；closeOnSelect 关掉即只发不收', () => {
    const picked: CommandSelectDetails[] = []
    const closed: CommandOpenChangeDetails[] = []
    const c = makeCommand({ defaultOpen: true, onSelect: d => picked.push(d), onOpenChange: d => closed.push(d) })

    c.api().select('export')
    expect(picked).toEqual([{ value: 'export', label: '导出报表' }])
    expect(c.state()).toBe('closed')
    // 选完自动收起也算「用户操作」，原因是 selection 不是 programmatic
    expect(closed).toEqual([{ open: false, reason: 'selection' }])

    const keep = makeCommand({ defaultOpen: true, closeOnSelect: false, onSelect: d => picked.push(d) })
    keep.api().select('users')
    expect(keep.state()).toBe('open')
  })

  it('禁用的命令选不动：不发 select、不收起', () => {
    const picked: CommandSelectDetails[] = []
    const c = makeCommand({ defaultOpen: true, onSelect: d => picked.push(d) })
    c.api().select('roles')
    expect(picked).toEqual([])
    expect(c.state()).toBe('open')
  })
})

describe('commandMachine 受控', () => {
  it('受控 open：用户事件只发意图，宿主写回才转移', () => {
    const seen: CommandOpenChangeDetails[] = []
    const c = makeCommand({ open: false, onOpenChange: d => seen.push(d) })

    c.api().setOpen(true)
    expect(c.state()).toBe('closed')
    expect(seen).toEqual([{ open: true }])

    c.setProps({ open: true })
    expect(c.state()).toBe('open')
  })

  it('受控检索串：打字只发意图，宿主写回后结果与锚点才跟着换', () => {
    const seen: CommandInputValueChangeDetails[] = []
    const c = makeCommand({ defaultOpen: true, inputValue: '', onInputValueChange: d => seen.push(d) })

    type(c.api().getInputProps(), '导出')
    expect(seen).toEqual([{ inputValue: '导出' }])
    // 宿主没写回：结果仍是全集，锚点也不动
    expect(c.api().inputValue).toBe('')
    expect(c.api().results.map(n => n.value)).toEqual(['users', 'roles', 'export'])

    c.setProps({ inputValue: '导出' })
    expect(c.api().results.map(n => n.value)).toEqual(['export'])
    expect(c.api().highlightedValue).toBe('export')
  })

  it('open 从布尔变回 undefined 即转非受控，不强制收起', () => {
    const c = makeCommand({ open: true })
    expect(c.state()).toBe('open')
    c.setProps({ open: undefined })
    expect(c.state()).toBe('open')
  })
})

describe('commandMachine 与连接层的边界', () => {
  it('活动候选与 aria-activedescendant 同步 aria-selected，其余项保持 false 且没有持久状态', () => {
    const c = makeCommand({ defaultOpen: true })
    const item = (value: string): Record<string, unknown> =>
      c.api().getItemProps({ value }) as unknown as Record<string, unknown>

    expect(item('users')['aria-selected']).toBe('true')
    expect(item('roles')['aria-selected']).toBe('false')
    expect(item('export')['aria-selected']).toBe('false')
    expect(item('users')['data-state']).toBeUndefined()
    expect(c.api().getInputProps()['aria-activedescendant']).toBe(item('users').id)

    key(c.api().getInputProps(), 'ArrowDown')
    expect(item('users')['aria-selected']).toBe('false')
    expect(item('roles')['aria-selected']).toBe('false')
    expect(item('export')['aria-selected']).toBe('true')
    expect(c.api().getInputProps()['aria-activedescendant']).toBe(item('export').id)
  })

  it('指针可移动活动候选，禁用项不接管；过滤为空或关闭后全部回到 false', () => {
    const c = makeCommand({ defaultOpen: true })
    const item = (value: string): Record<string, unknown> =>
      c.api().getItemProps({ value }) as unknown as Record<string, unknown>
    const move = (value: string): void => {
      (item(value).onPointerMove as (event: { currentTarget: object }) => void)({ currentTarget: {} })
    }

    move('export')
    expect(item('export')['aria-selected']).toBe('true')
    move('roles')
    expect(item('export')['aria-selected']).toBe('true')
    expect(item('roles')['aria-selected']).toBe('false')

    type(c.api().getInputProps(), '没有这条命令')
    expect(c.api().getInputProps()['aria-activedescendant']).toBeUndefined()
    expect(item('users')['aria-selected']).toBe('false')
    expect(item('roles')['aria-selected']).toBe('false')
    expect(item('export')['aria-selected']).toBe('false')

    c.api().setOpen(false)
    expect(item('users')['aria-selected']).toBe('false')
  })

  it('执行只消费当前活动候选：保持展开时仍为活动项，关闭时不留下持久选中', () => {
    const kept = makeCommand({ defaultOpen: true, closeOnSelect: false })
    kept.api().select('users')
    expect(kept.api().getItemProps({ value: 'users' })['aria-selected']).toBe('true')
    expect(kept.api().getItemProps({ value: 'users' })['data-state']).toBeUndefined()

    const closed = makeCommand({ defaultOpen: true })
    closed.api().select('users')
    expect(closed.state()).toBe('closed')
    expect(closed.api().getInputProps()['aria-activedescendant']).toBeUndefined()
    expect(closed.api().getItemProps({ value: 'users' })['aria-selected']).toBe('false')
  })

  it('锚点所指的命令被筛掉时当场作废，不留悬空的 aria-activedescendant', () => {
    const c = makeCommand({ defaultOpen: true })
    // 清单换成不含当前锚点的另一份：锚点还留在 context 里，连接层要挡住它
    c.setProps({ collection: [{ value: 'other', label: '别的' }] })
    expect(c.api().highlightedValue).toBe('other')
  })

  it('不在结果里的条目带 hidden，整组被筛空的分组也带 hidden', () => {
    const c = makeCommand({ defaultOpen: true })
    type(c.api().getInputProps(), '导出')
    const item = (value: string): Record<string, unknown> =>
      c.api().getItemProps({ value }) as unknown as Record<string, unknown>
    expect(item('export').hidden).toBeUndefined()
    expect(item('users').hidden).toBe(true)
    expect((c.api().getGroupProps({ value: 'nav' }) as unknown as Record<string, unknown>).hidden).toBe(true)
  })
})
