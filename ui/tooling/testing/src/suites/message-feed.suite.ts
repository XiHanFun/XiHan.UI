import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { messageFeedAnatomy, messageFeedKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/feed/'

const ROOT = '[data-scope="message-feed"][data-part="root"]'

function item(id: string, index: number, role: string, children?: readonly FixtureNode[]): FixtureNode {
  return {
    part: 'item',
    tag: 'article',
    attrs: { 'item-id': id, 'item-index': String(index), 'item-role': role },
    children,
  }
}

/** 消息内容由作者写，元素不替作者生成节点；条目的身份与序号写在节点自己的 item-* 上。 */
export const messageFeedSuite: ConformanceSuite = {
  component: 'message-feed',
  anatomy: messageFeedAnatomy,
  keyboard: messageFeedKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'viewport',
        children: [
          {
            part: 'list',
            children: [
              item('m1', 0, 'user', [{ part: 'item-label', text: '我' }]),
              item('m2', 1, 'assistant'),
              item('m3', 2, 'assistant'),
            ],
          },
        ],
      },
      { part: 'scroll-button', tag: 'button' },
      { part: 'live-region' },
    ],
  },
  cases: [
    {
      name: '默认：feed 与 article 成对，序号从 1 起，总数由 count 声明',
      spec: { apg: APG },
      props: { count: 3 },
      initial: {
        counts: { 'root': 1, 'viewport': 1, 'list': 1, 'item': 3, 'item-label': 1 },
        parts: {
          'root': {
            // 集合语义在 list 上：role=feed 只认 article 子节点，而播报区与回到底部按钮是 root 的孩子
            'role': null,
            // 没有锚点时容器认领唯一那个 Tab 停靠位
            'tabindex': '0',
            'data-state': 'idle',
            // 不发 aria-busy：它会压住同一棵子树内播报区的播报
            'aria-busy': null,
          },
          'list': { 'role': 'feed', 'aria-label': 'Conversation' },
          // 只有几何：不给 role、不给 aria-live、不给 tabindex
          'viewport': { 'role': null, 'aria-live': null, 'tabindex': null },
          'item': [
            { 'role': 'article', 'aria-posinset': '1', 'aria-setsize': '3', 'tabindex': '-1', 'data-role': 'user', 'data-value': 'm1' },
            { 'role': 'article', 'aria-posinset': '2', 'aria-setsize': '3', 'tabindex': '-1', 'data-role': 'assistant', 'data-value': 'm2' },
            { 'role': 'article', 'aria-posinset': '3', 'aria-setsize': '3', 'tabindex': '-1', 'data-role': 'assistant', 'data-value': 'm3' },
          ],
          'live-region': { 'role': null, 'aria-live': 'polite', 'aria-atomic': 'true' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '不给 count 时报 -1：ARIA 规定的「总数未知」，虚拟化或分页时 DOM 里的条数不等于会话长度',
      spec: { apg: APG },
      initial: {
        parts: {
          item: [{ 'aria-setsize': '-1' }, { 'aria-setsize': '-1' }, { 'aria-setsize': '-1' }],
        },
      },
    },
    {
      name: '渲了作者名就指过去，没渲的那条用文案兜底',
      spec: { apg: APG },
      props: { translations: { item: () => '消息' } },
      initial: {
        parts: {
          item: [
            // 第一条渲了 item-label
            { 'aria-label': null },
            { 'aria-label': '消息', 'aria-labelledby': null },
            { 'aria-label': '消息', 'aria-labelledby': null },
          ],
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是 aria-labelledby 与 item-label 节点的 id 相等，两个值都由实例级 scope 派生',
          run: ({ doc }: RawStepContext) => {
            const first = doc.querySelector<HTMLElement>('[data-scope="message-feed"][data-part="item"]')
            const label = doc.querySelector<HTMLElement>('[data-scope="message-feed"][data-part="item-label"]')
            if (!first || !label)
              throw new Error('找不到 message-feed 的 item 或 item-label 部件')
            if (first.getAttribute('aria-labelledby') !== label.id)
              throw new Error(`条目的 aria-labelledby 应指向作者名的 id，实际 ${first.getAttribute('aria-labelledby')} ≠ ${label.id}`)
          },
        },
      ],
    },
    {
      name: '焦点从流外进来：容器让位，焦点转投给第一条',
      spec: { apg: APG },
      covers: ['message-feed.kbd.tab'],
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            activeElement: { part: 'item', exact: true },
            // 锚点立起来之后容器退出 Tab 序，Tab 才能正常离开消息流
            parts: { root: { tabindex: '-1' } },
            events: [{ type: 'item-focus', detail: { id: 'm1' } }],
          },
        },
      ],
    },
    {
      name: 'PageDown / PageUp 在消息之间走，roving tabindex 跟着挪',
      spec: { apg: APG },
      covers: ['message-feed.kbd.next', 'message-feed.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'item[1]' },
        {
          kind: 'key',
          key: 'PageDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: [{ tabindex: '-1' }, { tabindex: '-1' }, { tabindex: '0' }] },
          },
        },
        {
          kind: 'key',
          key: 'PageUp',
          expect: { activeElement: { part: 'item[1]', exact: true } },
        },
      ],
    },
    {
      name: '默认不回绕：会话是线性的，末条再往下不动',
      spec: { apg: APG },
      covers: ['message-feed.kbd.next'],
      steps: [
        { kind: 'focus', part: 'item[2]' },
        { kind: 'key', key: 'PageDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
      ],
    },
    {
      name: '方向键不接管：滚动交给浏览器',
      spec: { apg: APG },
      covers: ['message-feed.kbd.scroll'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'raw',
          why: '要断言的是「没有 preventDefault」，只有拿到事件对象本身才看得见',
          run: ({ doc }: RawStepContext) => {
            const el = doc.querySelector<HTMLElement>(ROOT)
            if (!el)
              throw new Error('找不到 message-feed 的 root 部件')
            for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'End']) {
              const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              el.dispatchEvent(event)
              if (event.defaultPrevented)
                throw new Error(`message-feed 把 ${key} 吞掉了：键盘用户再也滚不动会话了`)
            }
          },
        },
      ],
    },
    {
      name: 'Ctrl+End / Ctrl+Home 一步走出消息流：会话界面里前者通常就是输入框',
      spec: { apg: APG },
      covers: ['message-feed.kbd.exit-after', 'message-feed.kbd.exit-before'],
      steps: [
        {
          kind: 'raw',
          why: '「走出去落在哪」要有一个流外的可聚焦元素才验得了，fixture 只描述组件自己的树',
          run: ({ doc }: RawStepContext) => {
            const after = doc.createElement('button')
            after.id = 'after-feed'
            after.textContent = '输入框'
            doc.body.appendChild(after)
          },
        },
        { kind: 'focus', part: 'item[1]' },
        {
          kind: 'key',
          key: 'End',
          modifiers: ['Control'],
          // 焦点落到组件之外，任何 part 都不再命中
          expect: { activeElement: null },
        },
        {
          kind: 'raw',
          why: '要核对的是落到了流后那一个具体元素上，activeElement 期望只能报「不在任何 part 内」',
          run: ({ doc }: RawStepContext) => {
            const after = doc.getElementById('after-feed')
            if (doc.activeElement !== after)
              throw new Error(`Ctrl+End 应落到消息流之后的第一个可聚焦元素上，实际落在 ${doc.activeElement?.tagName}`)
            after?.remove()
          },
        },
      ],
    },
    {
      name: '回到底部按钮：在底时收起，只看在不在底、不看粘附意图',
      spec: { apg: APG },
      covers: ['message-feed.kbd.scroll-button'],
      initial: {
        parts: {
          'scroll-button': { 'hidden': '', 'data-state': 'hidden', 'aria-label': 'Scroll to bottom', 'type': 'button' },
        },
      },
    },
  ],
}
