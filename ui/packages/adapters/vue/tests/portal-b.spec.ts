// @vitest-environment jsdom
// positioner 部件搬到 portal 落点：宿主祖先建了层叠上下文也压不住浮层。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhMentionContent,
  XhMentionInput,
  XhMentionPositioner,
  XhMentionRoot,
  XhMenuContent,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhPopselectContent,
  XhPopselectPositioner,
  XhPopselectRoot,
} from '../src'

/** 运行时默认的浮层落点，body 末尾那一个。 */
const PORTAL_ROOT_ID = 'xh-portal-root'
/** 应用级配置指定的落点。 */
const CUSTOM_ID = 'xh-portal-b'

let mounted: Array<() => void> = []

afterEach(() => {
  for (const un of mounted) un()
  mounted = []
  document.body.innerHTML = ''
})

/** 挂一棵作者写的树，返回它的宿主节点；container 给了就按应用级配置指定落点。 */
async function mountTree(children: () => unknown[], container?: () => HTMLElement | null): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({
    setup() {
      if (container)
        provideXhConfig({ portalContainer: container })
      return () => h('div', children() as never)
    },
  }))
  app.mount(host)
  mounted.push(() => {
    app.unmount()
    host.remove()
  })
  await nextTick()
  await nextTick()
  return host
}

function positionerOf(scope: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`)
}

/** 落在落点里，且不在作者那棵树里。 */
function expectPortaled(host: HTMLElement, scope: string, portalId = PORTAL_ROOT_ID): HTMLElement {
  const positioner = positionerOf(scope)
  expect(positioner).not.toBeNull()
  expect(document.getElementById(portalId)?.contains(positioner!)).toBe(true)
  expect(host.contains(positioner!)).toBe(false)
  return positioner!
}

const CASES: Array<{ scope: string, tree: (open: boolean) => unknown[] }> = [
  {
    scope: 'mention',
    tree: () => [
      h(XhMentionRoot, null, () => [
        h(XhMentionInput),
        h(XhMentionPositioner, null, () => [h(XhMentionContent, null, () => '正文')]),
      ]),
    ],
  },
  {
    scope: 'menu',
    tree: open => [
      h(XhMenuRoot, { open }, () => [
        h(XhMenuTrigger, null, () => '操作'),
        h(XhMenuPositioner, null, () => [h(XhMenuContent, null, () => '正文')]),
      ]),
    ],
  },
  {
    scope: 'popconfirm',
    tree: open => [
      h(XhPopconfirmRoot, { open }, () => [
        h(XhPopconfirmPositioner, null, () => [h(XhPopconfirmContent, null, () => '正文')]),
      ]),
    ],
  },
  {
    scope: 'popover',
    tree: open => [
      h(XhPopoverRoot, { open }, () => [
        h(XhPopoverTrigger, null, () => '打开'),
        h(XhPopoverPositioner, null, () => [h(XhPopoverContent, null, () => '正文')]),
      ]),
    ],
  },
  {
    scope: 'popselect',
    tree: open => [
      h(XhPopselectRoot, { open }, () => [
        h(XhPopselectPositioner, null, () => [h(XhPopselectContent, null, () => '正文')]),
      ]),
    ],
  },
]

describe('positioner 落在 portal 落点', () => {
  it.each(CASES)('$scope', async ({ scope, tree }) => {
    const host = await mountTree(() => tree(true))
    expectPortaled(host, scope)
  })

  it.each(CASES)('$scope 收起态也在落点里', async ({ scope, tree }) => {
    // content 常驻、靠内联 display 收起，所以收起态的整棵子树留在落点里
    const host = await mountTree(() => tree(false))
    const positioner = expectPortaled(host, scope)
    const content = positioner.querySelector<HTMLElement>('[data-part="content"]')!
    expect(content.style.display).toBe('none')
    // 常驻的这棵子树带 hidden，读屏与 Tab 序列都够不着它
    expect(content.hasAttribute('hidden')).toBe(true)
  })

  it.each(CASES)('$scope 卸载后落点里不留残骸', async ({ scope, tree }) => {
    await mountTree(() => tree(true))
    for (const un of mounted) un()
    mounted = []
    await nextTick()
    expect(positionerOf(scope)).toBeNull()
    expect(document.getElementById(PORTAL_ROOT_ID)?.childElementCount).toBe(0)
  })
})

describe('应用级配置指定的落点优先', () => {
  it.each(CASES)('$scope 落到配置给的容器里', async ({ scope, tree }) => {
    const custom = document.createElement('div')
    custom.id = CUSTOM_ID
    document.body.appendChild(custom)
    const host = await mountTree(() => tree(true), () => custom)
    expectPortaled(host, scope, CUSTOM_ID)
  })
})
