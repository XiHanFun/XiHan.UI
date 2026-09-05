// 使用者槽是改样式的唯一口子，这一组逐处证明覆盖真的落到屏幕上。
// 常态与状态各有各的槽的那几处，还要反过来证明「调常态不牵连状态」：
// 两档共用一个槽时，作者一改常态，状态那一档就跟着被抹平，从此再也调不开。
//
// 判据全是级联算出来的取值，只有真实浏览器算得出来：
// jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhCardDescription,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
  XhCascaderLabel,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxLabel,
  XhComboboxRoot,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerRoot,
  XhDrawerTitle,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormRoot,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationRoot,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhSelectLabel,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhTimerRoot,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
} from '../../src'
// 皮肤与令牌一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 三个一望即知不出自任何令牌的取值，用来分辨「覆盖生效」与「退回缺省」。 */
const RED = 'rgb(255, 0, 0)'
const LIME = 'rgb(0, 255, 0)'
const BLUE = 'rgb(0, 0, 255)'

let app: App | null = null
let host: HTMLElement | null = null
const overridden: string[] = []

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.replaceChildren()
  for (const name of overridden.splice(0))
    document.documentElement.style.removeProperty(name)
  // 指针停回角落：留在上一条用例的节点上，下一条挂载后会被补发一发真实 pointerenter
  await park()
})

/**
 * 覆盖写在根元素上：浮层被搬去 portal 落点，写在挂载点上的自定义属性传不过去。
 * 使用者真实的写法（`:root { --xh-…: … }`）也正是写在这一层。
 */
function setSlot(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value)
  overridden.push(name)
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
  await settle()
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const all = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  const el = all[index]
  if (!el)
    throw new Error(`没有第 ${index} 个 ${scope}/${name} 节点`)
  return el
}

function styleOf(el: HTMLElement, prop: string): string {
  return getComputedStyle(el).getPropertyValue(prop)
}

async function park(): Promise<void> {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
}

/** 悬停并等过渡跑完：颜色类过渡走 micro 档（120ms），中途读到的是插值不是终值。 */
async function hover(el: HTMLElement): Promise<void> {
  await userEvent.hover(el)
  await new Promise(r => setTimeout(r, 300))
}

// —— 卡片：常态与悬停各自的描边、投影，以及说明那一段的色与字号 ——

function CARD(): unknown {
  return h(XhCardRoot, { variant: 'outline', hoverable: true }, () => [
    h(XhCardHeader, null, () => [
      h(XhCardTitle, null, () => '标题'),
      h(XhCardDescription, null, () => '说明文字'),
    ]),
  ])
}

describe('card 的常态与悬停各有各的槽', () => {
  it('设悬停槽：指针停上去就换成它', async () => {
    setSlot('--xh-card-border-hover', RED)
    await mount(CARD)
    const root = part('card', 'root')

    expect(styleOf(root, 'border-top-color'), '没停上去时不该是悬停色').not.toBe(RED)
    await hover(root)
    expect(styleOf(root, 'border-top-color')).toBe(RED)
  })

  it('设常态槽：只改常态，悬停那一档照旧', async () => {
    // 先量一遍没有任何覆盖时悬停档的缺省
    await mount(CARD)
    await hover(part('card', 'root'))
    const fallback = styleOf(part('card', 'root'), 'border-top-color')
    app?.unmount()
    host?.remove()
    await park()

    setSlot('--xh-card-border', LIME)
    await mount(CARD)
    const root = part('card', 'root')
    expect(styleOf(root, 'border-top-color'), '常态该跟着改').toBe(LIME)

    await hover(root)
    expect(styleOf(root, 'border-top-color'), '悬停档被常态槽抹平了').not.toBe(LIME)
    expect(styleOf(root, 'border-top-color')).toBe(fallback)
  })

  it('投影同理：常态槽改不动悬停档', async () => {
    setSlot('--xh-card-shadow', `0 0 0 3px ${LIME}`)
    setSlot('--xh-card-shadow-hover', `0 0 0 3px ${RED}`)
    await mount(CARD)
    const root = part('card', 'root')

    await hover(root)
    expect(styleOf(root, 'box-shadow')).toContain(RED)
    expect(styleOf(root, 'box-shadow')).not.toContain(LIME)
  })

  it('说明那一段的色与字号都改得动', async () => {
    setSlot('--xh-card-description-fg', RED)
    setSlot('--xh-card-description-font-size', '29px')
    await mount(CARD)
    const description = part('card', 'description')

    expect(styleOf(description, 'color')).toBe(RED)
    expect(styleOf(description, 'font-size')).toBe('29px')
  })
})

// —— 手风琴：展开态的字色不再与常态共用一个槽 ——

function ACCORDION(): unknown {
  return h(XhAccordionRoot, { defaultValue: ['a'], collapsible: true }, () => [
    h(XhAccordionItem, { value: 'a' }, () => [
      h(XhAccordionHeader, null, () => [h(XhAccordionTrigger, null, () => '展开的那条')]),
      h(XhAccordionContent, null, () => '内容'),
    ]),
    h(XhAccordionItem, { value: 'b' }, () => [
      h(XhAccordionHeader, null, () => [h(XhAccordionTrigger, null, () => '收着的那条')]),
      h(XhAccordionContent, null, () => '内容'),
    ]),
  ])
}

describe('accordion 的展开态字色自成一档', () => {
  it('设展开槽：只有展开的那条跟着换', async () => {
    setSlot('--xh-accordion-trigger-fg-open', RED)
    await mount(ACCORDION)

    expect(styleOf(part('accordion', 'trigger', 0), 'color')).toBe(RED)
    expect(styleOf(part('accordion', 'trigger', 1), 'color')).not.toBe(RED)
  })

  it('设常态槽：收着的那条跟着换，展开那条的高亮不被抹平', async () => {
    await mount(ACCORDION)
    const fallback = styleOf(part('accordion', 'trigger', 0), 'color')
    app?.unmount()
    host?.remove()

    setSlot('--xh-accordion-trigger-fg', LIME)
    await mount(ACCORDION)

    expect(styleOf(part('accordion', 'trigger', 1), 'color'), '常态该跟着改').toBe(LIME)
    expect(styleOf(part('accordion', 'trigger', 0), 'color'), '展开档被常态槽抹平了').not.toBe(LIME)
    expect(styleOf(part('accordion', 'trigger', 0), 'color')).toBe(fallback)
  })
})

// —— 四家浮层的关闭钮：字形颜色改得动 ——

interface CloseCase {
  render: () => unknown
  /** 关闭钮所在的部件名，四家都叫 close-trigger */
  part: string
}

const CLOSE_CASES: Record<string, CloseCase> = {
  dialog: {
    part: 'close-trigger',
    render: () => h(XhDialogRoot, { open: true }, () => [
      h(XhDialogContent, null, () => [
        h(XhDialogTitle, null, () => '标题'),
        h(XhDialogDescription, null, () => '说明'),
        h(XhDialogCloseTrigger),
      ]),
    ]),
  },
  drawer: {
    part: 'close-trigger',
    render: () => h(XhDrawerRoot, { open: true }, () => [
      h(XhDrawerContent, null, () => [
        h(XhDrawerTitle, null, () => '标题'),
        h(XhDrawerCloseTrigger),
      ]),
    ]),
  },
  popover: {
    part: 'close-trigger',
    // 触发器要在：没有锚点的定位层算不出坐标，皮肤会一直把它按未落位藏着
    render: () => h(XhPopoverRoot, { open: true }, () => [
      h(XhPopoverTrigger, null, () => '打开'),
      h(XhPopoverPositioner, null, () => [
        h(XhPopoverContent, null, () => [h(XhPopoverCloseTrigger)]),
      ]),
    ]),
  },
  tour: {
    part: 'close-trigger',
    render: () => h(XhTourRoot, { open: true, steps: [{ id: 's1', title: '第一步' }] }, () => [
      h(XhTourPositioner, null, () => [
        h(XhTourContent, null, () => [h(XhTourCloseTrigger)]),
      ]),
    ]),
  },
}

describe('浮层关闭钮的字形颜色改得动', () => {
  for (const [scope, spec] of Object.entries(CLOSE_CASES)) {
    it(`${scope}：常态与悬停两档各自改得动`, async () => {
      setSlot(`--xh-${scope}-close-fg`, RED)
      setSlot(`--xh-${scope}-close-fg-hover`, BLUE)
      await mount(spec.render)
      const close = part(scope, spec.part)

      expect(styleOf(close, 'color')).toBe(RED)
      await hover(close)
      expect(styleOf(close, 'color')).toBe(BLUE)
    })
  }

  it('dialog 的说明字号与紧邻的标题一样有出口', async () => {
    setSlot('--xh-dialog-description-font-size', '27px')
    await mount(CLOSE_CASES.dialog!.render)

    expect(styleOf(part('dialog', 'description'), 'font-size')).toBe('27px')
  })
})

// —— 三件下拉的标签禁用色 ——

const FRUITS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

const LABEL_CASES: Record<string, () => unknown> = {
  select: () => h(XhSelectRoot, { disabled: true, collection: FRUITS }, () => [
    h(XhSelectLabel, null, () => '水果'),
    h(XhSelectTrigger, null, () => [h(XhSelectValueText)]),
  ]),
  cascader: () => h(XhCascaderRoot, { disabled: true, collection: FRUITS }, () => [
    h(XhCascaderLabel, null, () => '水果'),
    h(XhCascaderTrigger, null, () => [h(XhCascaderValueText)]),
  ]),
  combobox: () => h(XhComboboxRoot, { disabled: true, collection: FRUITS }, () => [
    h(XhComboboxLabel, null, () => '水果'),
    h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
  ]),
}

describe('下拉三件的标签禁用色改得动', () => {
  for (const [scope, render] of Object.entries(LABEL_CASES)) {
    it(`${scope}：禁用档的标签色跟着覆盖走`, async () => {
      setSlot(`--xh-${scope}-label-fg-disabled`, RED)
      await mount(render)
      const label = part(scope, 'label')

      expect(label.hasAttribute('data-disabled'), '这一档得真的挂上了才量得准').toBe(true)
      expect(styleOf(label, 'color')).toBe(RED)
    })
  }
})

// —— 侧栏当前页与祖先枝 ——

const SIDE_NAV_COLLECTION = [
  { value: 'dashboard', label: '工作台' },
  {
    value: 'user',
    label: '用户管理',
    children: [{ value: 'user-list', label: '用户列表' }],
  },
]

function SIDE_NAV(): unknown {
  return h(
    XhSideNavRoot,
    { collection: SIDE_NAV_COLLECTION, value: 'user-list', defaultExpandedValue: ['user'] },
    () => [
      h(XhSideNavList, null, () => [
        h(XhSideNavItem, null, () => [
          h(XhSideNavLink, { value: 'dashboard' }, () => [h(XhSideNavLinkText, null, () => '工作台')]),
        ]),
        h(XhSideNavBranch, { value: 'user' }, () => [
          h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => '用户管理')]),
          h(XhSideNavBranchContent, null, () => [
            h(XhSideNavItem, null, () => [
              h(XhSideNavLink, { value: 'user-list' }, () => [h(XhSideNavLinkText, null, () => '用户列表')]),
            ]),
          ]),
        ]),
      ]),
    ],
  )
}

describe('side-nav 当前页的品牌高亮有出口', () => {
  it('当前页的底色、字色与字重三样都改得动', async () => {
    setSlot('--xh-side-nav-row-bg-active', RED)
    setSlot('--xh-side-nav-row-fg-active', BLUE)
    setSlot('--xh-side-nav-row-font-weight-active', '800')
    await mount(SIDE_NAV)

    const current = part('side-nav', 'link', 1)
    expect(current.hasAttribute('data-current')).toBe(true)
    expect(styleOf(current, 'background-color')).toBe(RED)
    expect(styleOf(current, 'color')).toBe(BLUE)
    expect(styleOf(current, 'font-weight')).toBe('800')
  })

  it('当前页那组槽不牵连别的行', async () => {
    setSlot('--xh-side-nav-row-bg-active', RED)
    await mount(SIDE_NAV)

    expect(styleOf(part('side-nav', 'link', 0), 'background-color')).not.toBe(RED)
  })

  it('指到当前页的那条祖先枝也有自己的槽', async () => {
    setSlot('--xh-side-nav-row-fg-in-path', LIME)
    await mount(SIDE_NAV)

    const branch = part('side-nav', 'branch-trigger')
    expect(branch.hasAttribute('data-in-path')).toBe(true)
    expect(styleOf(branch, 'color')).toBe(LIME)
  })
})

// —— 计时器的数字段 ——

describe('timer 的数字段有自己的前景槽', () => {
  it('只染数字，记号不跟着走', async () => {
    setSlot('--xh-timer-item-fg', RED)
    await mount(() => h(XhTimerRoot, { startMs: 0 }))

    expect(styleOf(part('timer', 'item'), 'color')).toBe(RED)
    expect(styleOf(part('timer', 'separator'), 'color')).not.toBe(RED)
  })

  it('不设时随时间区继承：走完退一档，数字段跟得上', async () => {
    await mount(() => h(XhTimerRoot, { startMs: 0 }))

    expect(styleOf(part('timer', 'item'), 'color')).toBe(styleOf(part('timer', 'display'), 'color'))
  })
})

// —— 分页省略位：可点观感补齐 ——

describe('分页省略位划过换底', () => {
  const PAGINATION = (): unknown => h(
    XhPaginationRoot,
    { count: 2000, pageSize: 10, defaultPage: 100 },
    {
      default: ({ pageItems }: { pageItems: Array<Record<string, unknown>> }) =>
        pageItems.map((item, i) =>
          item.type === 'ellipsis'
            ? h(XhPaginationEllipsisTrigger, { key: `e${i}`, side: item.side as 'start' | 'end' })
            : h(XhPaginationItem, { key: `p${i}`, value: item.value as number }, () => String(item.value)),
        ),
    },
  )

  it('指针停上去底色跟着换，与页码走同一个槽', async () => {
    setSlot('--xh-pagination-item-bg-hover', RED)
    await mount(PAGINATION)
    const ellipsis = part('pagination', 'ellipsis-trigger')

    expect(styleOf(ellipsis, 'background-color'), '没停上去时不该有底色').not.toBe(RED)
    await hover(ellipsis)
    expect(styleOf(ellipsis, 'background-color')).toBe(RED)
  })
})

// —— 表单错误摘要：条目上那条链接的下划线偏移 ——

function FORM(): unknown {
  return h(XhFormRoot, { defaultErrors: { name: '必填' } }, () => [
    h(XhFormErrorSummary, null, () => [
      h(XhFormErrorSummaryItem, { value: 'name' }, () => '必填'),
    ]),
  ])
}

describe('错误摘要里链接的下划线偏移', () => {
  it('什么都不写时落在间距原语上', async () => {
    await mount(FORM)

    expect(styleOf(part('form', 'error-summary-item'), 'text-underline-offset')).toBe('2px')
  })

  it('设槽就改得动', async () => {
    setSlot('--xh-form-summary-item-underline-offset', '7px')
    await mount(FORM)

    expect(styleOf(part('form', 'error-summary-item'), 'text-underline-offset')).toBe('7px')
  })
})
