// @vitest-environment jsdom
// 注入键要扛得住「同一个模块被加载成两份」。
//
// 这不是假想：链到工作区的库在 dev server 下重建 dist 后，运行中的模块图会新旧混杂，
// context 模块重新执行一遍就是一个新的 Symbol；provide 拿新的、inject 拿旧的，
// 部件当场抛「必须用在 XxxRoot 内」——整棵子树白屏，而报错指向的是部件本身，
// 与真正的原因隔着十万八千里。
//
// Symbol.for 按字符串查同一个键，两份模块也对得上，于是这类失败降级成「照常工作」。
import type { InjectionKey } from 'vue'
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, inject, provide } from 'vue'
import { XhAccordionItem, XhAccordionRoot } from '../src'

/** 模拟一份被重新执行过的 context 模块：同名、但各自建自己的键。 */
function makeContextModule(name: string) {
  const KEY = Symbol.for(name)
  return {
    provideIt: (value: unknown) => provide(KEY, value),
    useIt: () => inject(KEY, null),
  }
}

describe('注入键的模块重复', () => {
  it('同名的两份 context 模块拿到的是同一个键', () => {
    const a = makeContextModule('xh-probe-context')
    const b = makeContextModule('xh-probe-context')

    let seen: unknown = null
    const Child = defineComponent({
      setup: () => {
        // 消费方来自「另一份」模块
        seen = b.useIt()
        return () => null
      },
    })
    const Root = defineComponent({
      setup: () => {
        // 提供方来自「这一份」模块
        a.provideIt({ ok: true })
        return () => h(Child)
      },
    })

    const app = createApp(Root)
    app.mount(document.createElement('div'))
    expect(seen).toEqual({ ok: true })
    app.unmount()
  })

  it('真组件提供的 context 在全局注册表里按名字查得到', () => {
    // 第三方视角：只知道名字，不 import 组件的 context 模块，用 Symbol.for 自己查一份键。
    // 键要是局部 Symbol，这里查到的就是 null——「另一份模块拿不到」在同一棵树里的等价形式。
    const seen: Record<string, unknown> = {}
    const Probe = defineComponent({
      setup: () => {
        seen.root = inject(Symbol.for('xh-accordion') as InjectionKey<unknown>, null)
        seen.item = inject(Symbol.for('xh-accordion-item') as InjectionKey<unknown>, null)
        return () => null
      },
    })

    const app = createApp({
      render: () => h(XhAccordionRoot, null, () => [
        h(XhAccordionItem, { value: 'a' }, () => [h(Probe)]),
      ]),
    })
    app.mount(document.createElement('div'))
    expect(seen.root).not.toBeNull()
    expect(seen.item).not.toBeNull()
    app.unmount()
  })

  it('库里所有注入键都走全局注册表', async () => {
    const { readFileSync, readdirSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')

    const offenders: string[] = []
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name)
        if (statSync(p).isDirectory())
          walk(p)
        else if (name.endsWith('.ts') && /Symbol\('xh-/.test(readFileSync(p, 'utf8')))
          offenders.push(p)
      }
    }
    walk('src')

    expect(offenders).toEqual([])
  })
})
