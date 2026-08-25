// @vitest-environment jsdom
// 注入键要扛得住「同一个模块被加载成两份」。
//
// 这不是假想：链到工作区的库在 dev server 下重建 dist 后，运行中的模块图会新旧混杂，
// context 模块重新执行一遍就是一个新的 Symbol；provide 拿新的、inject 拿旧的，
// 部件当场抛「必须用在 XxxRoot 内」——整棵子树白屏，而报错指向的是部件本身，
// 与真正的原因隔着十万八千里。
//
// Symbol.for 按字符串查同一个键，两份模块也对得上，于是这类失败降级成「照常工作」。
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, inject, provide } from 'vue'

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

  it('用局部 Symbol 就会断掉——这正是要防的那种失败', () => {
    const keyA = Symbol('xh-probe-context')
    const keyB = Symbol('xh-probe-context')
    expect(keyA).not.toBe(keyB)
    // 同名不同键：provide 与 inject 各拿一个，谁也找不到谁
    expect(Symbol.for('xh-probe-context')).toBe(Symbol.for('xh-probe-context'))
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
