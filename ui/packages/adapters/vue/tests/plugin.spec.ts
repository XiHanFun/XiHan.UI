// @vitest-environment jsdom
//
// @xihan-ui/vue/plugin：全量注册与 GlobalComponents。
// 名单直接取主入口的 Xh 前缀导出，这里核三件事：注册的就是主入口那一份、模板两种写法都认、
// 主入口的 Xh 前缀导出全是组件（哪天混进常量或函数，插件会把它当组件注册，这里先拦下）。
import type { GlobalComponents } from 'vue'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createApp, defineComponent, resolveComponent } from 'vue'
import * as entry from '../src'
import { XiHanUI } from '../src/plugin'

const names = Object.keys(entry).filter(name => /^Xh[A-Z]/.test(name))
const exported = entry as Record<string, unknown>

describe('@xihan-ui/vue/plugin', () => {
  it('把主入口的全部 Xh 组件按导出名注册为全局组件', () => {
    const app = createApp({ render: () => null })
    app.use(XiHanUI)
    expect(names.length).toBeGreaterThan(1000)
    for (const name of names)
      expect(app.component(name), name).toBe(exported[name])
  })

  it('模板里的 PascalCase 与 kebab-case 写法都解析到注册的组件', () => {
    const resolved: unknown[] = []
    const Probe = defineComponent({
      setup() {
        resolved.push(resolveComponent('XhButton'), resolveComponent('xh-button'), resolveComponent('xh-select-root'))
        return () => null
      },
    })
    const app = createApp(Probe)
    app.use(XiHanUI)
    app.mount(document.createElement('div'))
    expect(resolved).toEqual([entry.XhButton, entry.XhButton, entry.XhSelectRoot])
    app.unmount()
  })

  it('主入口的 Xh 前缀导出全是组件', () => {
    const notComponents = names.filter((name) => {
      const value = exported[name]
      return !(typeof value === 'object' && value !== null && ('setup' in value || 'render' in value))
    })
    expect(notComponents).toEqual([])
  })

  it('引入插件即给 GlobalComponents 补上组件类型', () => {
    expectTypeOf<GlobalComponents['XhButton']>().toEqualTypeOf<typeof entry.XhButton>()
    expectTypeOf<GlobalComponents['XhSelectRoot']>().toEqualTypeOf<typeof entry.XhSelectRoot>()
    expectTypeOf<GlobalComponents['XhTableRoot']>().toEqualTypeOf<typeof entry.XhTableRoot>()
  })
})
