// @vitest-environment jsdom
//
// 菜单栏入口被移出 DOM 时浏览器不派 focusout，焦点无声地掉到 body 上。
// 机器仍记着 focusedValue 指向那个入口：root 不再兜底进 Tab 序列，而那个锚点已经不存在，
// 于是整条菜单栏一个 Tab 停靠点都没有。适配器要在卸载时如实上报这件事。
import type { MenubarNode } from '@xihan-ui/headless'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhMenubarRoot, XhMenubarTrigger } from '../src'

const COLLECTION: MenubarNode[] = [
  { value: 'file', label: '文件', items: [{ value: 'new', label: '新建' }] },
  { value: 'edit', label: '编辑', items: [{ value: 'undo', label: '撤销' }] },
  { value: 'view', label: '视图', items: [{ value: 'zoom', label: '缩放' }] },
]

afterEach(() => {
  document.body.innerHTML = ''
})

interface Mounted {
  /** 改这个数组即增删入口或改写入口身份。 */
  values: Ref<string[]>
  unmount: () => void
}

/**
 * key 取位次而不是 value：value 换掉时 Vue 复用同一个 DOM 节点，
 * 「节点还在、身份变了」这一路才演得出来；删的一律是末位，卸载的就是末位那个实例。
 */
function mountMenubar(initial: readonly string[]): Mounted {
  const values = ref<string[]>([...initial])
  const harness = defineComponent({
    setup: () => () => h(XhMenubarRoot, { collection: COLLECTION }, () =>
      values.value.map((value, i) => h(XhMenubarTrigger, { key: i, value }, () => value))),
  })
  const wrapper = mount(harness, { attachTo: document.body })
  return { values, unmount: () => wrapper.unmount() }
}

function part(name: string): HTMLElement {
  return document.body.querySelector<HTMLElement>(`[data-scope="menubar"][data-part="${name}"]`)!
}

function triggers(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>('[data-scope="menubar"][data-part="trigger"]')]
}

/**
 * 整条菜单栏对键盘用户的入口：root 与入口里 tabindex=0 的那些。
 * root 是焦点在栏外时的兜底停靠点，入口里只有 roving 锚点那个留在 Tab 序列内。
 */
function tabStops(): HTMLElement[] {
  return [part('root'), ...triggers()].filter(node => node.getAttribute('tabindex') === '0')
}

describe('xhMenubar 入口的焦点落点如实上报', () => {
  it('持有焦点的入口被摘掉：焦点锚点当场清空，root 重新兜底进 Tab 序列', async () => {
    const { values, unmount } = mountMenubar(['file', 'edit', 'view'])

    triggers()[2]!.focus()
    await nextTick()
    // 焦点已在栏内：root 让位，停靠点归焦点入口
    expect(tabStops().map(n => n.getAttribute('data-value'))).toEqual(['view'])

    values.value = ['file', 'edit']
    await nextTick()
    await nextTick()

    expect(triggers()).toHaveLength(2)
    // 锚点若还停在已消失的 'view' 上，root 与入口会同时是 -1，整条栏零停靠点
    expect(tabStops().length).toBeGreaterThan(0)
    expect(part('root').getAttribute('tabindex')).toBe('0')

    unmount()
  })

  it('持有焦点的入口换了身份：锚点跟着改记新值', async () => {
    const { values, unmount } = mountMenubar(['file', 'edit'])

    triggers()[1]!.focus()
    await nextTick()
    expect(triggers()[1]!.getAttribute('tabindex')).toBe('0')

    // 同一个 DOM 节点复用，只是 value 换了：机器不重报就还记着已经不在场的旧值，
    // 那个锚点没有入口认领，整条栏于是一个 Tab 停靠点都没有
    values.value = ['file', 'view']
    await nextTick()
    await nextTick()

    const list = triggers()
    expect(list[1]!.getAttribute('data-value')).toBe('view')
    expect(list[1]!.getAttribute('tabindex')).toBe('0')

    unmount()
  })

  it('摘掉的不是焦点入口时，锚点原地不动', async () => {
    const { values, unmount } = mountMenubar(['file', 'edit', 'view'])

    triggers()[1]!.focus()
    await nextTick()

    values.value = ['file', 'edit']
    await nextTick()
    await nextTick()

    // 锚点仍在 'edit'：root 不该被抬回 Tab 序列，方向键的起点也还在
    expect(tabStops().map(n => n.getAttribute('data-value'))).toEqual(['edit'])
    expect(part('root').getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(triggers()[1])

    unmount()
  })

  it('入口摘掉时它展开的菜单一并收起，焦点不被抢回栏内', async () => {
    const { values, unmount } = mountMenubar(['file', 'edit', 'view'])

    triggers()[2]!.focus()
    triggers()[2]!.click()
    await nextTick()
    expect(part('root').getAttribute('data-state')).toBe('open')

    values.value = ['file', 'edit']
    await nextTick()
    await nextTick()

    // 展开的那张菜单随入口一起没了，栏必须回到收起态
    expect(part('root').getAttribute('data-state')).toBe('closed')
    // 焦点已经掉到 body 上，收起不该把它塞回剩下的某个入口
    expect(document.activeElement).toBe(document.body)

    unmount()
  })
})
