import type { ConformanceCase, ConformanceSuite, FixtureNode } from '../conformance/types'
import { toolbarAnatomy, toolbarKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const KBD = `${APG}#keyboardinteraction`
const ARIA = `${APG}#roles_states_properties`

// 两种禁用声明都要摘：WC 侧 conformance 会先把 fixture 里的 disabled 改写成 aria-disabled，
// 只摘 disabled 的话，改写过的那条会原样留下。
function stripDisabled(node: FixtureNode): FixtureNode {
  const attrs = node.attrs ? { ...node.attrs } : undefined
  if (attrs) {
    delete attrs.disabled
    delete attrs['aria-disabled']
  }
  return { ...node, attrs, children: node.children?.map(stripDisabled) }
}

/** 条目全部放开：默认 fixture 的第二个禁用，条目一被跳过，左右各走哪边就分不出来了。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return stripDisabled(base)
}

/**
 * root 末尾放一颗「更多」钮。只在收纳的用例里出现：作者不写这个部件就不收纳，
 * 其余用例的 order / counts 因此一条都不用改。
 */
function withOverflowTrigger(base: FixtureNode): FixtureNode {
  return { ...base, children: [...(base.children ?? []), { part: 'overflow-trigger', tag: 'button' }] }
}

const ITEM_SIZE = 40
const TRIGGER_SIZE = 32

/**
 * 收纳要量排布，jsdom 没有排版：把工具条伪造成一排定长的格子。露着的条目（40）与「更多」钮（32）
 * 按文档序沿主轴从 root 的起始缘排开，分隔线与分组不占长度；root 两个方向都是 length。
 * 主轴随 root 的 data-orientation 走。机器在挂载那一刻就量，所以要先于挂载装上、卸载后原样放回。
 */
function overflowRow(length: number): NonNullable<ConformanceCase['environment']> {
  return (win) => {
    const proto = win.HTMLElement.prototype
    const element = win.Element.prototype
    const saved = {
      offsetWidth: Object.getOwnPropertyDescriptor(proto, 'offsetWidth'),
      offsetHeight: Object.getOwnPropertyDescriptor(proto, 'offsetHeight'),
      clientWidth: Object.getOwnPropertyDescriptor(element, 'clientWidth'),
      clientHeight: Object.getOwnPropertyDescriptor(element, 'clientHeight'),
      rect: Object.getOwnPropertyDescriptor(element, 'getBoundingClientRect'),
    }
    const originalRect = saved.rect?.value as ((this: Element) => DOMRect) | undefined
    if (!originalRect)
      throw new Error('环境里没有 Element.prototype.getBoundingClientRect，伪造不了排版')
    const isPart = (el: Element, part: string): boolean =>
      el.getAttribute('data-scope') === 'toolbar' && el.getAttribute('data-part') === part
    const rootOf = (el: Element): Element | null => el.closest('[data-scope="toolbar"][data-part="root"]')
    const flowing = (el: Element): boolean => isPart(el, 'item') || isPart(el, 'overflow-trigger')
    const sizeOf = (el: Element): number => (isPart(el, 'overflow-trigger') ? TRIGGER_SIZE : ITEM_SIZE)
    /** 条目在主轴上的起点；藏着的返回 null。 */
    const startOf = (el: Element): number | null => {
      const root = rootOf(el)
      if (!root || (el as HTMLElement).hidden)
        return null
      let start = 0
      for (const other of root.querySelectorAll('[data-scope="toolbar"]')) {
        if (other === el)
          return start
        if (flowing(other) && !(other as HTMLElement).hidden)
          start += sizeOf(other)
      }
      return null
    }
    const mainSize = (el: Element): number | undefined => {
      if (isPart(el, 'root'))
        return length
      if (flowing(el))
        return startOf(el) == null ? 0 : sizeOf(el)
      return undefined
    }
    const define = (target: object, key: string, fallback: PropertyDescriptor | undefined): void => {
      Object.defineProperty(target, key, {
        configurable: true,
        get(this: Element) {
          return mainSize(this) ?? fallback?.get?.call(this) ?? 0
        },
      })
    }
    define(proto, 'offsetWidth', saved.offsetWidth)
    define(proto, 'offsetHeight', saved.offsetHeight)
    define(element, 'clientWidth', saved.clientWidth)
    define(element, 'clientHeight', saved.clientHeight)
    Object.defineProperty(element, 'getBoundingClientRect', {
      configurable: true,
      writable: true,
      value(this: Element): DOMRect {
        const size = mainSize(this)
        if (size == null)
          return originalRect.call(this)
        const start = isPart(this, 'root') ? 0 : (startOf(this) ?? 0)
        const vertical = rootOf(this)?.getAttribute('data-orientation') === 'vertical'
        const [left, top, width, height] = isPart(this, 'root')
          ? [0, 0, length, length]
          : vertical ? [0, start, size, size] : [start, 0, size, size]
        return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
      },
    })
    const restore = (target: object, key: string, descriptor: PropertyDescriptor | undefined): void => {
      if (descriptor)
        Object.defineProperty(target, key, descriptor)
      else
        delete (target as Record<string, unknown>)[key]
    }
    return () => {
      restore(proto, 'offsetWidth', saved.offsetWidth)
      restore(proto, 'offsetHeight', saved.offsetHeight)
      restore(element, 'clientWidth', saved.clientWidth)
      restore(element, 'clientHeight', saved.clientHeight)
      restore(element, 'getBoundingClientRect', saved.rect)
    }
  }
}

/** 收起的条目在「更多」菜单里的那一项（菜单浮层在 Vue / React 里被搬到 body 下，从整个文档查）。 */
function overflowMenuItem(doc: Document, value: string): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)
}

/**
 * 等焦点落进菜单：菜单展开后由焦点域在动画帧上落焦，真实浏览器里这一步晚于适配器的提交。
 * 逐帧等，落到了就返回；等满几帧还没落到，交给调用处按原样判红。
 */
async function focusSettled(doc: Document, flush: () => Promise<void>, target: () => Element | null): Promise<boolean> {
  return settled(doc, flush, () => doc.activeElement != null && doc.activeElement === target())
}

/** 逐帧等一个条件成立；等满帧数还不成立返回 false。 */
async function settled(doc: Document, flush: () => Promise<void>, done: () => boolean, frames = 10): Promise<boolean> {
  const win = doc.defaultView!
  for (let round = 0; round < frames; round++) {
    if (done())
      return true
    await flush()
    await new Promise<void>(resolve => win.requestAnimationFrame(() => resolve()))
  }
  return done()
}

/**
 * 等「更多」菜单的退场播完：content 收成 display none。真实浏览器里退场要播一段动画，
 * 这条用例测的是从收起状态重新展开，不测退场途中的打断。
 */
async function menuExited(doc: Document, flush: () => Promise<void>): Promise<void> {
  const content = (): HTMLElement | null => doc.querySelector<HTMLElement>('[data-scope="menu"][data-part="content"]')
  const hidden = (): boolean => {
    const el = content()
    return el == null || doc.defaultView!.getComputedStyle(el).display === 'none'
  }
  if (!await settled(doc, flush, hidden, 60))
    throw new Error('「更多」菜单收起后退场没有播完')
}

/**
 * 工具条只管导航与 ARIA：条目是原生 `<button>`，它们各自的激活行为归自己，
 * 因此这里没有"按 Enter 会怎样"的用例——那不是工具条承诺的事。
 *
 * fixture 刻意把四个条目摆成"两个裸条目 + 一条分隔线 + 一个分组里两个条目"：
 * 导航必须跨过分隔线、穿进分组，Home/End 也不能把端点算到分隔线头上。
 * 第二个条目用 disabled 声明禁用（WC 侧的 conformance 会改写成 aria-disabled），
 * 导航时被跳过，但仍可聚焦、仍能当方向键起点。
 */
export const toolbarSuite: ConformanceSuite = {
  component: 'toolbar',
  anatomy: toolbarAnatomy,
  keyboard: toolbarKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'item', tag: 'button', attrs: { value: 'bold' }, text: '粗体' },
      { part: 'item', tag: 'button', attrs: { value: 'italic', disabled: '' }, text: '斜体' },
      { part: 'separator' },
      {
        part: 'group',
        children: [
          { part: 'item', tag: 'button', attrs: { value: 'left' }, text: '左对齐' },
          { part: 'item', tag: 'button', attrs: { value: 'right' }, text: '右对齐' },
        ],
      },
    ],
  },
  cases: [
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整条只占一个 Tab 位，无锚点时容器兜底',
      spec: { apg: APG },
      covers: ['toolbar.kbd.tab'],
      steps: [singleTabStop('toolbar', 'item', 'root')],
    },
    {
      name: 'ARIA 骨架：root=toolbar 带朝向，group=group 不带朝向，separator 与主轴垂直',
      spec: { apg: ARIA },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'separator', 'group', 'item[2]', 'item[3]'],
        counts: { root: 1, item: 4, separator: 1, group: 1 },
        parts: {
          root: {
            'role': 'toolbar',
            'aria-orientation': 'horizontal',
            // 显式 false 是"明确说了没禁用"，省略只是"没说"
            'aria-disabled': 'false',
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'tabindex': '0',
          },
          group: {
            // role=group 不收 aria-orientation（不在它的支持列表里），给了就是无效 ARIA
            'role': 'group',
            'aria-orientation': null,
            'data-orientation': 'horizontal',
            // 分组不是可停留点，绝不占 Tab 位
            'tabindex': null,
          },
          separator: {
            'role': 'separator',
            // 横排工具条里的分隔线是竖线
            'aria-orientation': 'vertical',
            'data-orientation': 'vertical',
            // 分隔线既不入导航也不进 Tab 序列，更不该带身份标记
            'tabindex': null,
            'data-value': null,
          },
          item: [
            {
              // 工具条绝不覆盖条目的角色：条目是按钮/切换钮/下拉触发器，语义归它自己
              'role': null,
              'aria-disabled': 'false',
              'data-value': 'bold',
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
              // 默认条目接 Action Control 的 text 档：ghost 形态、恒显，档位随工具条 size 走
              'data-xh-action-control': '',
              'data-xh-action-profile': 'text',
              'data-xh-action-variant': 'ghost',
              'data-xh-action-display': 'always',
              'data-xh-action-size': 'md',
            },
            {
              'role': null,
              'aria-disabled': 'true',
              'data-value': 'italic',
              'data-disabled': '',
              // 禁用条目照样留在导航里，只是没被锚点选中
              'tabindex': '-1',
              'disabled': null,
            },
            { 'aria-disabled': 'false', 'data-value': 'left', 'tabindex': '-1', 'disabled': null },
            { 'aria-disabled': 'false', 'data-value': 'right', 'tabindex': '-1', 'disabled': null },
          ],
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '横排方向键走左右：跳过禁用条目、跨过分隔线走进分组、尽头回绕',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [
                { tabindex: '-1' },
                // 禁用的 italic 被跳过
                { tabindex: '-1' },
                { tabindex: '0' },
                { tabindex: '-1' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            // 工具条自己不派任何对外事件：条目要说什么由条目自己说
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[3]', exact: true }, events: [] },
        },
        // 尽头回绕：从分组内的末项绕回分组外的首项
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
        // 往回走同样跨结构、同样跳过禁用项
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[3]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '横排里的上下键不归工具条管：原样放行给页面滚动与读屏',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.cross-axis'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: ({ doc }) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"]')!
            for (const key of ['ArrowDown', 'ArrowUp']) {
              const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              item.dispatchEvent(e)
              if (e.defaultPrevented)
                throw new Error(`横排工具条把 ${key} 吞掉了：页面滚动会跟着一起没`)
            }
          },
          // 交叉轴的键连焦点都不该动
          expect: { activeElement: { part: 'item[0]', exact: true } },
        },
      ],
    },
    {
      name: 'Home / End 到端点：禁用条目不当端点，分隔线与分组更不算',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.first', 'toolbar.kbd.last'],
      steps: [
        { kind: 'focus', part: 'item[2]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true }, events: [] } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true }, events: [] } },
      ],
    },
    {
      name: 'orientation=vertical：朝向翻面，分隔线跟着转横，方向键换到上下',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev', 'toolbar.kbd.cross-axis'],
      props: { orientation: 'vertical' },
      initial: {
        parts: {
          root: { 'aria-orientation': 'vertical', 'data-orientation': 'vertical' },
          group: { 'data-orientation': 'vertical' },
          // 竖排工具条里的分隔线是横线
          separator: { 'aria-orientation': 'horizontal', 'data-orientation': 'horizontal' },
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 竖排里的左右键换成了交叉轴，焦点一步都不动
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl：水平主轴上左右键语义对调',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev'],
      fixture: allEnabled,
      props: { dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: 'loop=false：撞到尽头停在原地，不回绕',
      spec: { apg: KBD },
      props: { loop: false },
      steps: [
        { kind: 'focus', part: 'item[3]' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '禁用条目：焦点落得上去，还能当方向键的起点',
      spec: { apg: ARIA },
      steps: [
        {
          kind: 'focus',
          part: 'item[1]',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              // 禁用条目照样认领锚点与 Tab 位
              item: [{ tabindex: '-1' }, { 'aria-disabled': 'true', 'tabindex': '0' }, { tabindex: '-1' }],
            },
            activeElement: { part: 'item[1]', exact: true },
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[2]', exact: true } },
        },
      ],
    },
    {
      name: '整条 disabled：条目全部 aria-disabled，方向键不再接管',
      spec: { apg: ARIA },
      props: { disabled: true },
      initial: {
        parts: {
          root: { 'aria-disabled': 'true', 'data-disabled': '' },
          group: { 'data-disabled': '' },
          item: [
            { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
            { 'aria-disabled': 'true', 'data-disabled': '' },
            { 'aria-disabled': 'true', 'data-disabled': '' },
            { 'aria-disabled': 'true', 'data-disabled': '' },
          ],
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '焦点从条外落到容器：转投第一个可停留条目，兑现 tabindex=0 的承诺',
      spec: { apg: KBD },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [{ tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }, { tabindex: '-1' }],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：条目投影 data-pressed，抬起、失焦或指针取消撤下；只亮按住的那一条',
      spec: { adr: 'press-channel' },
      covers: ['toolbar.kbd.press'],
      steps: [
        heldPress('toolbar', 'item', { value: 'bold' }),
        // 分组里的条目同一条通路
        heldPress('toolbar', 'item', { value: 'left' }),
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const bold = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"][data-value="bold"]')!
            const left = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"][data-value="left"]')!
            bold.focus()
            bold.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (!bold.hasAttribute('data-pressed') || left.hasAttribute('data-pressed'))
              throw new Error('按住 bold 时只有它该投影 data-pressed')
            bold.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (bold.hasAttribute('data-pressed'))
              throw new Error('keyup 之后 bold 应撤下 data-pressed')
          },
        },
      ],
    },
    {
      name: '禁用条目按住不进入按压面；整条 disabled 时全部不进，按住途中转禁用即撤下',
      spec: { adr: 'press-channel' },
      steps: [
        heldPressIgnored('toolbar', 'item', '条目 aria-disabled，不接受按压', { value: 'italic' }),
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const bold = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"][data-value="bold"]')!
            bold.focus()
            bold.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (!bold.hasAttribute('data-pressed'))
              throw new Error('按住 Space 时 bold 应投影 data-pressed')
          },
        },
        // 条目只是 aria-disabled、仍有焦点，不会再来 keyup，按压面由机器收
        { kind: 'setProps', props: { disabled: true }, expect: { parts: { item: [{ 'aria-disabled': 'true', 'data-pressed': null }] } } },
        heldPressIgnored('toolbar', 'item', '整条禁用时条目不接受按压', { value: 'bold' }),
        heldPressIgnored('toolbar', 'item', '整条禁用时分组里的条目也不接受按压', { value: 'left' }),
      ],
    },
    {
      name: '全部放得下：「更多」钮收着，条目一个不收',
      spec: { apg: ARIA },
      fixture: withOverflowTrigger,
      environment: overflowRow(400),
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'separator', 'group', 'item[2]', 'item[3]', 'overflow-trigger'],
        parts: {
          'item': [{ hidden: null }, { hidden: null }, { hidden: null }, { hidden: null }],
          'overflow-trigger': { 'hidden': '', 'type': 'button', 'aria-label': 'More', 'aria-expanded': 'false' },
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
      ],
    },
    {
      name: '放不下：尾部条目收进「更多」菜单，钮露面并接上菜单触发器的接线',
      spec: { apg: ARIA },
      fixture: withOverflowTrigger,
      // 4 × 40 = 160 放不进 130；给钮让出 32 后剩 98，前两个放得下
      environment: overflowRow(130),
      initial: {
        parts: {
          'item': [{ hidden: null }, { hidden: null }, { hidden: '', tabindex: '-1' }, { hidden: '', tabindex: '-1' }],
          'overflow-trigger': {
            'hidden': null,
            'type': 'button',
            'aria-label': 'More',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            'aria-controls': '@extern(menu:*:content)',
            'aria-disabled': 'false',
            'data-state': 'closed',
            'tabindex': '-1',
            // 与条目同档的单图标钮：Action Control icon 档、ghost 形态，档位随工具条 size 走
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '菜单条目归 menu 的 scope，不进工具条的快照',
          run: ({ doc }) => {
            const left = overflowMenuItem(doc, 'left')
            const right = overflowMenuItem(doc, 'right')
            if (!left || !right || overflowMenuItem(doc, 'bold'))
              throw new Error('「更多」菜单里应当恰好是收起的 left 与 right')
            if (left.textContent?.trim() !== '左对齐' || left.getAttribute('role') !== 'menuitem')
              throw new Error('菜单项取条目的文字、角色是 menuitem')
          },
        },
      ],
    },
    {
      name: '方向键把「更多」钮当最后一站：收起的条目跳过，End 落到钮上，尽头回绕',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev', 'toolbar.kbd.last'],
      fixture: withOverflowTrigger,
      environment: overflowRow(130),
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 禁用的 italic 跳过，收起的 left / right 跳过
            activeElement: { part: 'overflow-trigger', exact: true },
            parts: {
              'root': { tabindex: '-1' },
              'item': [{ tabindex: '-1' }, { tabindex: '-1' }, { tabindex: '-1' }, { tabindex: '-1' }],
              'overflow-trigger': { tabindex: '0' },
            },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'overflow-trigger', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '「更多」钮展开菜单、Escape 收起并把焦点还给钮；菜单里选中一项即替收起的条目触发点击',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.overflow-open', 'toolbar.kbd.overflow-close'],
      fixture: withOverflowTrigger,
      environment: overflowRow(130),
      steps: [
        { kind: 'focus', part: 'overflow-trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { 'overflow-trigger': { 'aria-expanded': 'true', 'data-state': 'open' } } },
        },
        {
          kind: 'raw',
          why: '焦点落进了 menu 的 scope，工具条的快照里看不到它',
          run: async ({ doc, flush }) => {
            if (!await focusSettled(doc, flush, () => overflowMenuItem(doc, 'left')))
              throw new Error('ArrowDown 展开后焦点应落在菜单首项 left 上')
          },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { 'overflow-trigger': { 'aria-expanded': 'false', 'data-state': 'closed' } },
            activeElement: { part: 'overflow-trigger', exact: true },
          },
        },
        {
          kind: 'raw',
          why: '条目的点击由条目自己的处理器接住，工具条不派对外事件',
          run: async ({ doc, flush }) => {
            const right = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"][data-value="right"]')!
            let clicks = 0
            const count = (): void => {
              clicks += 1
            }
            right.addEventListener('click', count)
            try {
              const trigger = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!
              await menuExited(doc, flush)
              trigger.focus()
              trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
              if (!await focusSettled(doc, flush, () => overflowMenuItem(doc, 'right')))
                throw new Error('ArrowUp 展开后焦点应落在菜单末项 right 上')
              overflowMenuItem(doc, 'right')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
              await flush()
              if (clicks !== 1)
                throw new Error(`菜单里选中 right 应替它触发一次点击，实际 ${clicks} 次`)
              if (trigger.getAttribute('aria-expanded') !== 'false')
                throw new Error('选中后菜单应收起')
              // 收起后焦点回到钮上，下一条断言在它落定之后读
              await focusSettled(doc, flush, () => trigger)
            }
            finally {
              right.removeEventListener('click', count)
            }
          },
          expect: { activeElement: { part: 'overflow-trigger', exact: true } },
        },
      ],
    },
    {
      name: '竖排：钮上的上下键归工具条走位，不展开菜单',
      spec: { apg: KBD },
      fixture: withOverflowTrigger,
      environment: overflowRow(130),
      props: { orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'overflow-trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            // italic 禁用跳过，回到 bold
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'overflow-trigger': { 'aria-expanded': 'false' } },
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'overflow-trigger', exact: true } } },
      ],
    },
  ],
}
