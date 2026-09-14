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

  it('声明里不引 core，也不引 dist——前者消费方解析不到，后者源码树里还不存在', async () => {
    const source = await readFile(fileURLToPath(new URL('../build/index.d.mts', import.meta.url)), 'utf8')
    expect(source).not.toContain('@xihan-ui/core')
    expect(source).not.toMatch(/from '\.\.\/dist\//)
  })

  it('自带的 IconRecord / IconNode 与 core 那份逐字段一致', async () => {
    const local = await readFile(fileURLToPath(new URL('../build/index.d.mts', import.meta.url)), 'utf8')
    const core = await readFile(
      fileURLToPath(new URL('../../../engine/core/src/kernel/types/icon.ts', import.meta.url)),
      'utf8',
    )

    // 只比字段：注释与 IconTag 这类本地不复刻的具名类型不参与
    const fieldsOf = (source: string, name: string): string[] => {
      const body = source.match(new RegExp(`export interface ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? ''
      return body
        // 块注释跨行，必须在整段上剥掉，逐行剥是剥不干净的
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map(line => line.replace(/\/\/.*/g, '').trim())
        .filter(Boolean)
        .map(line => line.replace(/IconTag/g, 'string'))
        .sort()
    }

    for (const name of ['IconRecord', 'IconNode']) {
      expect(fieldsOf(local, name), name).not.toEqual([])
      expect(fieldsOf(local, name), name).toEqual(fieldsOf(core, name))
    }
  })
})
