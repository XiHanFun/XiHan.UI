import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as codegen from '../build/index.mjs'

// build/index.d.mts 是手写的——管线没有 TS 源可发射声明，也不在 typecheck 的 include 里
// （它引发布产物 dist/，而 typecheck 不依赖本包的 build）。这条测试替代那份检查：
// 保证对外声明的名字集合与运行期导出逐一对得上。
describe('codegen 子路径的声明与运行期一致', () => {
  it('声明的名字集合 == 导出的名字集合', async () => {
    const source = await readFile(fileURLToPath(new URL('../build/index.d.mts', import.meta.url)), 'utf8')
    const declared = new Set(
      [...source.matchAll(/^export declare (?:function|const|class)\s+(\w+)/gm)].map(match => match[1]),
    )
    const exported = new Set(Object.keys(codegen))

    expect([...declared].sort()).toEqual([...exported].sort())
  })

  it('声明里不引 kernel——它只在 devDependencies 里，消费方解析不到', async () => {
    const source = await readFile(fileURLToPath(new URL('../build/index.d.mts', import.meta.url)), 'utf8')
    expect(source).not.toContain('@xihan-ui/kernel')
  })
})
