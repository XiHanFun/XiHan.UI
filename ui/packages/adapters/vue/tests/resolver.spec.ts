// @vitest-environment node
//
// @xihan-ui/vue/resolver：unplugin-vue-components 在构建工具里调用它，拿到的是 PascalCase 名字。
// 主入口的每个组件都要解析到同名导出；不是 Xh 前缀的名字留给别的解析器。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as entry from '../src'
import { XiHanUIResolver } from '../src/resolver'

describe('@xihan-ui/vue/resolver', () => {
  const resolver = XiHanUIResolver()

  it('是组件解析器', () => {
    expect(resolver.type).toBe('component')
  })

  it('主入口的每个 Xh 组件都解析到 @xihan-ui/vue 的同名导出', () => {
    const names = Object.keys(entry).filter(name => /^Xh[A-Z]/.test(name))
    expect(names.length).toBeGreaterThan(1000)
    for (const name of names)
      expect(resolver.resolve(name), name).toEqual({ name, from: '@xihan-ui/vue' })
  })

  it('不是 Xh 前缀的名字不解析', () => {
    for (const name of ['Button', 'ElButton', 'NButton', 'RouterLink', 'Xhbutton', 'XH', 'MyXhButton', 'XiHanUI'])
      expect(resolver.resolve(name), name).toBeUndefined()
  })

  it('不引用任何模块：在构建工具里加载它不会把组件带进来', () => {
    const source = readFileSync(new URL('../src/resolver.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^\s*(?:import|export\s+(?:\*|\{[^}]*\})\s+from)\s/m)
  })
})
