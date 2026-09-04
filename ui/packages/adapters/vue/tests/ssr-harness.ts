import type { Fixture } from '@xihan-ui/testing'
import type { SsrHarness } from '@xihan-ui/testing/ssr'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { renderFixtureNode, resolveRoot } from './fixture-vnode'

/**
 * Vue 的服务端直出宿主。
 * 不挂 DOM、不接对外事件监听器：服务端只渲一帧，没有交互也没有 emit。
 */
export function createVueSsrHarness(): SsrHarness {
  return {
    adapterName: 'vue',
    async renderToString(fixture: Fixture) {
      const Root = resolveRoot(fixture.component)
      const app = createSSRApp({
        setup: () => () =>
          h(Root, { ...fixture.tree.attrs, ...fixture.props }, {
            default: () => fixture.tree.children?.map(c => renderFixtureNode(c, fixture.component)) ?? [],
          }),
      })
      app.config.warnHandler = (message) => {
        throw new Error(`[Vue warn]: ${message}`)
      }
      // 浮层族有的就地渲染、有的 Teleport 出去，两处合起来才是这一屏的全部标记
      const ctx: { teleports?: Record<string, string> } = {}
      const html = await renderToString(app, ctx)
      return html + Object.values(ctx.teleports ?? {}).join('')
    },
  }
}
