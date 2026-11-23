// @vitest-environment jsdom

import type { TreeSelectNode } from '@xihan-ui/headless'
import type { App, Component } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineAsyncComponent, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhTreeSelectRoot } from '../src'

const CITIES: TreeSelectNode[] = [
  { value: 'east', label: '华东', children: [{ value: 'east-shanghai', label: '上海' }] },
  { value: 'north', label: '华北', children: [{ value: 'north-beijing', label: '北京' }] },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await Promise.resolve()
  }
}

/** 文档站那一页：几个示例各自异步加载，最后一个首帧没有数据、打开后才取。 */
function createPage(loaders: Array<() => Promise<Component>>): Component {
  const demos = loaders.map(loader => defineAsyncComponent(loader))
  return defineComponent({
    setup: () => () => h('main', null, demos.map(demo => h('section', null, [h(demo)]))),
  })
}

function treeSelectDemo(label: string, collection: () => TreeSelectNode[]): Component {
  return defineComponent({
    name: `Demo-${label}`,
    setup: () => () => h(XhTreeSelectRoot, { label, collection: collection() }),
  })
}

describe('vue 浮层的服务端水合', () => {
  it('同页多个浮层乱序水合，各自认领自己的正文，晚到的数据照常渲染', async () => {
    document.getElementById('xh-portal-root')?.remove()
    const late = ref<TreeSelectNode[]>([])
    const components = [
      treeSelectDemo('甲', () => CITIES),
      treeSelectDemo('乙', () => CITIES),
      treeSelectDemo('丙', () => late.value),
    ]

    // 服务端：没有 document，加载器当场给出组件
    const serverPage = createPage(components.map(c => () => Promise.resolve(c)))
    const ctx: { teleports?: Record<string, string> } = {}
    vi.stubGlobal('document', undefined)
    let html: string
    try {
      html = await renderToString(createSSRApp(serverPage), ctx)
    }
    finally {
      vi.unstubAllGlobals()
    }

    // 照 VitePress 的做法把 teleport 出去的标记写在 body 开头
    const teleported = document.createElement('div')
    teleported.innerHTML = ctx.teleports?.body ?? ''
    const injected = [...teleported.childNodes]
    document.body.prepend(...injected)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)

    // 客户端：示例分包到达的先后与文档序相反
    const resolvers: Array<() => void> = []
    const clientPage = createPage(components.map(c => () => new Promise<Component>((resolve) => {
      resolvers.push(() => resolve(c))
    })))

    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const captured: unknown[] = []
    let app: App | null = createSSRApp(clientPage)
    app.config.errorHandler = error => captured.push(error)

    try {
      app.mount(host)
      await settle()
      for (const resolve of [...resolvers].reverse()) {
        resolve()
        await settle()
      }

      const roots = [...host.querySelectorAll<HTMLElement>(`[data-scope='tree-select'][data-part='root']`)]
      expect(roots).toHaveLength(3)
      const trees = roots.map((root) => {
        const id = root.querySelector(`[data-part='trigger']`)!.getAttribute('aria-controls')!
        return document.getElementById(id)
      })
      // 每个实例的树都在文档里、互不相同
      expect(trees.every(tree => tree?.isConnected)).toBe(true)
      expect(new Set(trees).size).toBe(3)
      // 正文搬到了正式落点
      for (const tree of trees)
        expect(tree!.closest('[data-xh-portal-shell]')?.parentElement?.id).toBe('xh-portal-root')

      // 晚到的数据：落进第三个实例自己的树
      late.value = CITIES
      await settle()
      const lateTree = trees[2]!
      expect(lateTree.querySelectorAll(`[data-part='branch']`)).toHaveLength(2)
      expect(lateTree.textContent).toContain('华东')
      expect(trees[0]!.querySelectorAll(`[data-part='branch']`)).toHaveLength(2)

      expect(captured).toEqual([])
      expect(errors).not.toHaveBeenCalled()
      expect(warnings).not.toHaveBeenCalled()
    }
    finally {
      app?.unmount()
      app = null
      warnings.mockRestore()
      errors.mockRestore()
      host.remove()
      for (const node of injected)
        node.parentNode?.removeChild(node)
      document.getElementById('xh-portal-root')?.remove()
    }
  })
})
