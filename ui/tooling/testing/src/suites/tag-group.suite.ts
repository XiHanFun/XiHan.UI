import type { AttrExpectation, ConformanceSuite, FixtureNode, SnapshotExpectation, StepWithExpect } from '../conformance/types'
import { tagGroupAnatomy, tagGroupKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

/** 四枚标签的值，文档序。 */
const VALUES = ['vue', 'react', 'svelte', 'angular'] as const

const LIST = '[data-scope="tag-group"][data-part="list"]'
/** 一枚标签就是 tag 的 root，直接套在 list 下；戴的是 tag 的 scope，快照采不到它。 */
const ITEM = `${LIST} > [data-scope="tag"][data-part="root"]`
/** 标签文字是 tag 的 label，摘除钮是 tag 的 close-trigger，两者都落在标签里那一格之内。 */
const ITEM_TEXT = `${ITEM} > [data-scope="tag-group"][data-part="cell"] > [data-scope="tag"][data-part="label"]`
const DELETE_TRIGGER = `${ITEM} > [data-scope="tag-group"][data-part="cell"] > [data-scope="tag"][data-part="close-trigger"]`

/**
 * 四枚标签：react 禁用（方向键与连打都跳过它，但它仍可聚焦、仍是导航起点）。
 * 文字用拉丁字母，连打检索按首字母匹配得上；四枚首字母互不相同。
 * item / item-text / item-delete-trigger 是作者侧的写法名，渲出来是 tag 的 root / label / close-trigger。
 */
function item(value: string, text: string, disabled = false): FixtureNode {
  const attrs: Record<string, string> = { value }
  if (disabled)
    attrs.disabled = ''
  return {
    part: 'item',
    tag: 'span',
    attrs,
    children: [
      {
        part: 'cell',
        tag: 'span',
        children: [
          { part: 'item-text', tag: 'span', text },
          { part: 'item-delete-trigger', tag: 'button' },
        ],
      },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '技术栈' },
    {
      part: 'list',
      children: [
        item('vue', 'Vue'),
        item('react', 'React', true),
        item('svelte', 'Svelte'),
        item('angular', 'Angular'),
      ],
    },
  ],
}

function items(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(ITEM)]
}

function deleteTriggers(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(DELETE_TRIGGER)]
}

function nth(all: readonly HTMLElement[], index: number, label: string): HTMLElement {
  const el = all[index]
  if (!el)
    throw new Error(`${label}[${index}] 不存在（共 ${all.length} 个）`)
  return el
}

/** 逐个属性比对：期望里写 null 的属性必须缺席。 */
function assertAttrs(el: Element, expected: AttrExpectation, label: string): void {
  for (const [name, want] of Object.entries(expected)) {
    const got = el.getAttribute(name)
    if (got !== want)
      throw new Error(`${label} 的 ${name} 不符：期望 ${JSON.stringify(want)}，实际 ${JSON.stringify(got)}`)
  }
}

function describeFocus(doc: Document): string {
  const ae = doc.activeElement
  if (!ae || ae === doc.body)
    return '（body）'
  const index = items(doc).indexOf(ae as HTMLElement)
  if (index >= 0)
    return `item[${index}]`
  return `<${ae.tagName.toLowerCase()} data-scope=${ae.getAttribute('data-scope')} data-part=${ae.getAttribute('data-part')}>`
}

interface TagsCheck {
  /** 第几枚标签该长什么样，下标是文档序。 */
  readonly items?: Readonly<Record<number, AttrExpectation>>
  /** 第几枚标签的摘除钮该长什么样。 */
  readonly deleteTriggers?: Readonly<Record<number, AttrExpectation>>
  /** 焦点恰落在第几枚标签本身；'list' 是落在容器上；'outside' 是不在组内。 */
  readonly focused?: number | 'list' | 'outside'
}

/**
 * 标签、文字与摘除钮都戴 tag 的 scope：快照只采本组件的部件，焦点落点也解析不到它们，
 * 这些事实只能直接读 DOM。
 */
function tags(check: TagsCheck, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '标签戴 tag 的 scope，快照采不到它、焦点落点也解析不到它，只能直接读 DOM',
    run: ({ doc }) => {
      const all = items(doc)
      if (all.length !== VALUES.length)
        throw new Error(`标签个数不符：期望 ${VALUES.length}，实际 ${all.length}`)
      for (const [index, expected] of Object.entries(check.items ?? {}))
        assertAttrs(nth(all, Number(index), 'item'), expected, `item[${index}]`)
      const triggers = deleteTriggers(doc)
      for (const [index, expected] of Object.entries(check.deleteTriggers ?? {}))
        assertAttrs(nth(triggers, Number(index), 'item-delete-trigger'), expected, `item-delete-trigger[${index}]`)
      if (check.focused === undefined)
        return
      const list = doc.querySelector<HTMLElement>(LIST)
      const ae = doc.activeElement
      if (check.focused === 'outside') {
        if (list && ae && list.contains(ae))
          throw new Error(`焦点期望不在组内，实际 ${describeFocus(doc)}`)
        return
      }
      const want = check.focused === 'list' ? list : nth(all, check.focused, 'item')
      if (ae !== want)
        throw new Error(`焦点期望恰在 ${check.focused === 'list' ? 'list' : `item[${check.focused}]`}，实际 ${describeFocus(doc)}`)
    },
    expect,
  }
}

/** 四枚标签的选中标记，逐个写全——只写关心的那个会漏掉「另一枚也被选中了」。 */
function selectedMarks(...values: readonly string[]): Record<number, AttrExpectation> {
  const out: Record<number, AttrExpectation> = {}
  VALUES.forEach((v, i) => {
    out[i] = {
      'aria-selected': values.includes(v) ? 'true' : 'false',
      'data-selected': values.includes(v) ? '' : null,
    }
  })
  return out
}

/** 与 focus 步同一个动作，只是目标戴 tag 的 scope。 */
function focusItem(index: number, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '标签戴 tag 的 scope，声明式 focus 步找不到它',
    run: ({ doc }) => nth(items(doc), index, 'item').focus?.(),
    expect,
  }
}

/** 与 click 步同一个动作（先聚焦再点），只是目标戴 tag 的 scope。 */
function clickItem(index: number, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '标签戴 tag 的 scope，声明式 click 步找不到它',
    run: ({ doc }) => {
      const el = nth(items(doc), index, 'item')
      el.focus?.()
      el.click()
    },
    expect,
  }
}

/** 与 click 步同一个动作（先聚焦再点），只是目标戴 tag 的 scope。 */
function clickDeleteTrigger(index: number, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '摘除钮戴 tag 的 scope，声明式 click 步找不到它',
    run: ({ doc }) => {
      const el = nth(deleteTriggers(doc), index, 'item-delete-trigger')
      el.focus?.()
      el.click()
    },
    expect,
  }
}

/** 鼠标那一路：按下不聚焦（主键的 pointerdown 被拦下），随后的 click 照常送达。 */
function pressDeleteTrigger(index: number, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '按下不夺焦是 pointerdown 上的 preventDefault，声明式步骤派不出这个事件',
    run: ({ doc }) => {
      const el = nth(deleteTriggers(doc), index, 'item-delete-trigger')
      const down = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
      el.dispatchEvent(down)
      if (!down.defaultPrevented)
        throw new Error(`item-delete-trigger[${index}] 的主键按下没被拦下，焦点会被这颗叉夺走`)
      const secondary = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 2 })
      el.dispatchEvent(secondary)
      if (secondary.defaultPrevented)
        throw new Error(`item-delete-trigger[${index}] 把右键按下也拦了，上下文菜单开不出来`)
      el.click()
    },
    expect,
  }
}

/** roving tabindex：整组只留一个 Tab 停靠点，没有锚点标签时由容器兜底（tabindex=0）。 */
function singleTabStop(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，且标签戴 tag 的 scope，逐个部件的属性期望表达不了',
    run: ({ doc }) => {
      const stops = items(doc).filter(el => el.getAttribute('tabindex') === '0')
      const containerStop = doc.querySelector<HTMLElement>(LIST)?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`tag-group 组内有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !containerStop)
        throw new Error('tag-group 组内一个 Tab 停靠点都没有，且容器也没兜底——键盘再也进不来')
      if (stops.length === 1 && containerStop)
        throw new Error('tag-group 已有锚点标签占着 Tab 位，容器不该再占一个')
    },
  }
}

/** 等到第 index 枚标签的某个属性到达期望值：settle 步只认本组件的部件。 */
function settleItem(index: number, name: string, value: string | null, expect?: SnapshotExpectation): StepWithExpect {
  return {
    kind: 'raw',
    why: '标签戴 tag 的 scope，settle 步的条件找不到它',
    run: async ({ doc, flush }) => {
      for (let i = 0; i < 100; i++) {
        await flush()
        if (nth(items(doc), index, 'item').getAttribute(name) === value)
          return
        await new Promise<void>(resolve => setTimeout(resolve, 10))
      }
      throw new Error(`item[${index}] 的 ${name} 未到达 ${JSON.stringify(value)}，实际 ${JSON.stringify(nth(items(doc), index, 'item').getAttribute(name))}`)
    },
    expect,
  }
}

export const tagGroupSuite: ConformanceSuite = {
  component: 'tag-group',
  anatomy: tagGroupAnatomy,
  keyboard: tagGroupKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：list 是 grid、标签是 tag 的 root 并担 row、格子是 gridcell、文字是 tag 的 label；不接选中即不出 aria-selected，摘除钮是 tag 的 close-trigger、收起且不占 Tab 位',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        // 标签、文字与摘除钮戴 tag 的 scope，不进本组件的解剖：本组件只剩容器、标题、列表与格子
        order: ['root', 'label', 'list', 'cell[0]', 'cell[1]', 'cell[2]', 'cell[3]'],
        counts: { root: 1, label: 1, list: 1, cell: 4 },
        parts: {
          'root': { 'data-orientation': 'horizontal', 'data-disabled': null, 'data-readonly': null },
          'label': { id: '@self' },
          'list': {
            'id': '@self',
            'role': 'grid',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            // 焦点还在组外：容器兜底进 Tab 序列
            'tabindex': '0',
          },
          // 摘除钮可聚焦，只有落在 gridcell 下面才是合法嵌套；格子与标签共用同一份状态标记
          'cell[0]': { 'role': 'gridcell', 'data-selected': null, 'data-highlighted': null, 'data-disabled': null },
          'cell[1]': { 'role': 'gridcell', 'data-disabled': '' },
        },
      },
      steps: [
        tags({
          items: {
            0: {
              'role': 'row',
              // selectionMode 缺省是 none，一排纯标记标签报「未选中」是句假话
              'aria-selected': null,
              'aria-disabled': 'false',
              'data-value': 'vue',
              // 宿主受控 open=true：tag 的 root 恒为展示态
              'data-state': 'open',
              'hidden': null,
              'data-selected': null,
              'data-selectable': null,
              'data-deletable': null,
              'data-disabled': null,
              'data-highlighted': null,
              // 三轴没写就不产出属性，缺省档由皮肤承担
              'data-variant': null,
              'data-tone': null,
              'data-size': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
              'disabled': null,
            },
            1: { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null, 'tabindex': '-1' },
            3: { 'data-value': 'angular', 'tabindex': '-1' },
          },
          // 整组没开放摘除：连按钮一起收起，不留一个按不动的叉
          deleteTriggers: {
            0: {
              'type': 'button',
              'aria-label': 'Delete vue',
              'tabindex': '-1',
              'hidden': '',
              'disabled': '',
              'data-disabled': '',
            },
          },
        }),
        {
          kind: 'raw',
          why: '文字与作者名不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            const texts = [...doc.querySelectorAll<HTMLElement>(ITEM_TEXT)]
            if (texts.length !== VALUES.length)
              throw new Error(`标签文字（tag 的 label）个数不符：期望 ${VALUES.length}，实际 ${texts.length}`)
            if (texts[0]!.textContent?.trim() !== 'Vue')
              throw new Error(`item-text[0] 文本不符：期望 "Vue"，实际 ${JSON.stringify(texts[0]!.textContent)}`)
            for (const part of ['item', 'item-text', 'item-delete-trigger']) {
              if (doc.querySelector(`[data-scope="tag-group"][data-part="${part}"]`))
                throw new Error(`${part} 不该再戴 tag-group 的 scope`)
            }
          },
        },
      ],
    },
    {
      name: '三轴写在组上，逐枚落到 tag 的 root 上；格子不重复标注',
      spec: { adr: 'visual-axes' },
      props: { variant: 'solid', tone: 'success', size: 'lg' },
      initial: {
        parts: { 'cell[0]': { 'data-variant': null, 'data-tone': null, 'data-size': null } },
      },
      steps: [
        tags({
          items: {
            0: { 'data-variant': 'solid', 'data-tone': 'success', 'data-size': 'lg' },
            3: { 'data-variant': 'solid', 'data-tone': 'success', 'data-size': 'lg' },
          },
        }),
      ],
    },
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整排标签只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      covers: ['tag-group.kbd.tab'],
      steps: [
        singleTabStop(),
        { kind: 'focus', part: 'list', expect: { parts: { list: { tabindex: '-1' } } } },
        tags({ focused: 0, items: { 0: { tabindex: '0' } } }),
        singleTabStop(),
      ],
    },
    {
      name: '方向键：横向排布走左右键，跳过禁用项、尽头回绕，Home/End 到端点，一路不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.next', 'tag-group.kbd.prev', 'tag-group.kbd.first', 'tag-group.kbd.last'],
      steps: [
        { kind: 'focus', part: 'list' },
        tags({ focused: 0 }),
        // react 禁用，直接跨过去
        { kind: 'key', key: 'ArrowRight', expect: { events: [] } },
        tags({
          focused: 2,
          items: { 2: { 'tabindex': '0', 'data-highlighted': '' }, 0: { 'tabindex': '-1', 'data-highlighted': null } },
        }),
        { kind: 'key', key: 'ArrowRight' },
        tags({ focused: 3 }),
        { kind: 'key', key: 'ArrowRight' },
        tags({ focused: 0 }),
        { kind: 'key', key: 'ArrowLeft' },
        tags({ focused: 3 }),
        { kind: 'key', key: 'End' },
        tags({ focused: 3 }),
        { kind: 'key', key: 'Home', expect: { events: [] } },
        // 方向键只搬焦点：走了这么一圈，一枚标签都不该被选中
        tags({ focused: 0, items: selectedMarks() }),
      ],
    },
    {
      name: '连打检索把焦点移到首字母匹配的标签，不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'list' },
        tags({ focused: 0 }),
        { kind: 'key', key: 's', expect: { events: [] } },
        tags({ focused: 2, items: selectedMarks() }),
      ],
    },
    {
      name: '单选：Enter / Space 选中焦点标签并替换原有选中；选中落在 tag 的 root 上',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'single' },
      covers: ['tag-group.kbd.select'],
      initial: { parts: { list: { 'aria-multiselectable': 'false' } } },
      steps: [
        tags({ items: { 0: { 'data-selectable': '' } } }),
        { kind: 'focus', part: 'list' },
        { kind: 'key', key: 'Space', expect: { events: [{ type: 'value-change', detail: { value: ['vue'] } }] } },
        tags({ items: selectedMarks('vue') }, { parts: { 'cell[0]': { 'data-selected': '' }, 'cell[2]': { 'data-selected': null } } }),
        { kind: 'key', key: 'ArrowRight', expect: { events: [] } },
        { kind: 'key', key: 'Enter', expect: { events: [{ type: 'value-change', detail: { value: ['svelte'] } }] } },
        tags({ items: selectedMarks('svelte') }, { parts: { 'cell[0]': { 'data-selected': null }, 'cell[2]': { 'data-selected': '' } } }),
      ],
    },
    {
      name: '复选：Enter 切换而不是替换，grid 报 aria-multiselectable',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.toggle'],
      initial: { parts: { list: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'focus', part: 'list' },
        { kind: 'key', key: 'Enter' },
        tags({ items: selectedMarks('vue') }),
        { kind: 'key', key: 'ArrowRight' },
        { kind: 'key', key: 'Enter', expect: { events: [{ type: 'value-change', detail: { value: ['vue', 'svelte'] } }] } },
        tags({ items: selectedMarks('vue', 'svelte') }),
        { kind: 'key', key: 'Enter', expect: { events: [{ type: 'value-change', detail: { value: ['vue'] } }] } },
        tags({ items: selectedMarks('vue') }),
      ],
    },
    {
      name: 'Ctrl+A 全选可选标签（禁用项不进集合），再按一次取消',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.select-all'],
      steps: [
        { kind: 'focus', part: 'list' },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: { events: [{ type: 'value-change', detail: { value: ['vue', 'svelte', 'angular'] } }] },
        },
        tags({ items: selectedMarks('vue', 'svelte', 'angular') }),
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: { events: [{ type: 'value-change', detail: { value: [] } }] },
        },
        tags({ items: selectedMarks() }),
      ],
    },
    {
      name: 'Delete 摘掉焦点标签，焦点交给前一枚；只报意图，条目的去留归宿主',
      spec: { apg: APG },
      props: { deletable: true },
      covers: ['tag-group.kbd.delete'],
      steps: [
        // 整组开放摘除：摘除钮留在原地、可按
        tags({ items: { 0: { 'data-deletable': '' } }, deleteTriggers: { 0: { 'hidden': null, 'disabled': null, 'data-disabled': null } } }),
        { kind: 'focus', part: 'list' },
        tags({ focused: 0 }),
        { kind: 'key', key: 'ArrowRight' },
        { kind: 'key', key: 'ArrowRight' },
        tags({ focused: 3 }),
        { kind: 'key', key: 'Delete', expect: { events: [{ type: 'item-delete', detail: { value: 'angular' } }] } },
        // 落点取前一枚：摘完之后它在文档里的位置原样不动
        tags({ focused: 2, items: { 2: { 'data-highlighted': '' } } }),
      ],
    },
    {
      name: 'Backspace 摘掉首枚：前面没有标签了，焦点交给后一枚',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        { kind: 'focus', part: 'list' },
        tags({ focused: 0 }),
        { kind: 'key', key: 'Backspace', expect: { events: [{ type: 'item-delete', detail: { value: 'vue' } }] } },
        tags({ focused: 1 }),
      ],
    },
    {
      name: '点摘除钮（tag 的 close-trigger）：报摘除意图，焦点同样交给前一枚标签，不会掉回页面开头',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        tags({ deleteTriggers: { 3: { 'type': 'button', 'aria-label': 'Delete angular', 'tabindex': '-1', 'hidden': null, 'disabled': null } } }),
        clickDeleteTrigger(3, { events: [{ type: 'item-delete', detail: { value: 'angular' } }] }),
        tags({ focused: 2 }),
      ],
    },
    {
      name: '摘除钮的可及名走本组的 translations.deleteItem：由宿主传到 tag 的 close-trigger 上，不是 tag 自己的「关闭」',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { deletable: true, translations: { deleteItem: (text: string) => `移除${text}` } },
      steps: [
        tags({ deleteTriggers: { 0: { 'aria-label': '移除vue' }, 3: { 'aria-label': '移除angular' } } }),
      ],
    },
    {
      name: '鼠标点摘除钮：主键按下不夺焦，焦点在组外就留在组外；右键按下不拦',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        pressDeleteTrigger(3, { events: [{ type: 'item-delete', detail: { value: 'angular' } }] }),
        tags({ focused: 'outside' }),
      ],
    },
    {
      name: '禁用的标签摘不掉：那颗叉留在原地但按不动，Delete 也不认',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        tags({ deleteTriggers: { 1: { 'disabled': '', 'data-disabled': '', 'hidden': null } } }),
        // 方向键与连打都跳过禁用项，只能直接把焦点放上去——禁用标签仍可聚焦、仍是导航起点
        focusItem(1),
        tags({ focused: 1, items: { 1: { 'data-highlighted': '' } } }),
        { kind: 'key', key: 'Delete', expect: { events: [] } },
        clickDeleteTrigger(1, { events: [] }),
      ],
    },
    {
      name: '只读：可聚焦、可导航，但选不动也摘不掉；摘除钮原生禁用、标签本身不置灰',
      spec: { adr: 'controlled-uncontrolled' },
      props: { selectionMode: 'multiple', deletable: true, readOnly: true },
      initial: {
        parts: {
          root: { 'data-readonly': '' },
          list: { 'aria-readonly': 'true' },
        },
      },
      steps: [
        tags({
          items: { 0: { 'data-disabled': null, 'aria-disabled': 'false' } },
          deleteTriggers: { 0: { 'disabled': '', 'data-disabled': '', 'hidden': null } },
        }),
        { kind: 'focus', part: 'list' },
        tags({ focused: 0 }),
        { kind: 'key', key: 'Enter', expect: { events: [] } },
        tags({ items: selectedMarks() }),
        { kind: 'key', key: 'Delete', expect: { events: [] } },
        clickDeleteTrigger(0, { events: [] }),
      ],
    },
    {
      name: '整组禁用：标签全转 aria-disabled 并置灰，键盘一律不响应',
      spec: { apg: APG },
      props: { selectionMode: 'multiple', deletable: true, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'list': { 'aria-disabled': 'true', 'data-disabled': '' },
          'cell[0]': { 'data-disabled': '' },
        },
      },
      steps: [
        tags({
          items: { 0: { 'aria-disabled': 'true', 'data-disabled': '' } },
          deleteTriggers: { 0: { disabled: '' } },
        }),
        focusItem(0),
        { kind: 'key', key: 'Enter', expect: { events: [] } },
        tags({ focused: 0, items: selectedMarks() }),
        { kind: 'key', key: 'ArrowRight', expect: { events: [] } },
        tags({ focused: 0 }),
      ],
    },
    {
      name: '受控 value：点选只发 value-change 不自改 DOM，父写回后才变',
      spec: { adr: 'controlled-uncontrolled' },
      props: { selectionMode: 'multiple', value: [] },
      steps: [
        clickItem(0, { events: [{ type: 'value-change', detail: { value: ['vue'] } }] }),
        tags({ items: selectedMarks() }),
        { kind: 'setProps', props: { value: ['vue'] } },
        settleItem(0, 'data-selected', ''),
        tags({ items: selectedMarks('vue') }, { parts: { 'cell[0]': { 'data-selected': '' } } }),
      ],
    },
  ],
}
