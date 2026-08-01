// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

interface RegistryEntry { version: string, ctor: CustomElementConstructor }

const pkg = JSON.parse(
  readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'),
) as { version: string }

defineXhElements()

function registry(): Map<string, RegistryEntry> {
  return (globalThis as unknown as Record<string, Map<string, RegistryEntry>>).__XIHAN_UI_WC__
}

describe('元素注册版本', () => {
  it('注册表已装上元素', () => {
    expect(registry().size).toBeGreaterThan(60)
  })

  // 重复副本守卫按版本判定：版本若是源码里的字面量，发布后每一份副本都自报同一个值，
  // prev.version === version 恒真，第二份副本的元素类会被静默丢弃。
  it('注册版本取自 package.json，不是写死的字面量', () => {
    const entry = registry().get('xh-dialog')
    expect(entry).toBeDefined()
    expect(entry!.version).toBe(pkg.version)
  })

  it('全部元素报同一个版本', () => {
    const versions = new Set([...registry().values()].map(e => e.version))
    expect([...versions]).toEqual([pkg.version])
  })

  // 上面两条在版本还是 0.0.0 时恒真，要等第一次发布才会红，那时已经晚了。
  // 这条直接钉源码形状：版本号不许以字面量出现在 src 里。
  it('src 里没有写死的版本号字面量', () => {
    const src = readFileSync(join(import.meta.dirname, '../src/define.ts'), 'utf8')
    expect(src).not.toMatch(/=\s*['"]\d+\.\d+\.\d+/)
  })
})
