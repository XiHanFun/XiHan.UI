// @vitest-environment node
import { describe, expect, it } from 'vitest'

// M2-A6：主入口在无 DOM 的 Node 下必须可 import 且不注册元素、不崩。
describe('node import smoke（无 DOM 惰性注册）', () => {
  it('主入口可 import，导出运行时原语，不触碰 HTMLElement', async () => {
    const mod = await import('../src/index')
    expect(typeof mod.createLitRuntime).toBe('function')
    expect(typeof mod.MachineController).toBe('function')
    expect(typeof mod.defineElement).toBe('function')
    expect(typeof mod.createSpreader).toBe('function')
    expect(typeof mod.wcNormalize).toBe('object')
  })

  it('defineElement 在无 customElements 时静默跳过', async () => {
    const { defineElement } = await import('../src/index')
    expect(() => defineElement('xh-nope', class {} as CustomElementConstructor, '0.0.0')).not.toThrow()
  })
})
