// @vitest-environment node
import { describe, expect, it } from 'vitest'

// 主入口在无 DOM 的 Node 下必须可 import 且不注册元素、不崩。
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

// 任何 meta-framework 都会在 Node 里把入口模块求值一次，元素类的定义式不能在那一刻炸。
describe('node import：元素入口', () => {
  it('define 入口可 import', async () => {
    await expect(import('../src/define')).resolves.toBeDefined()
  })

  it('无 customElements 时 defineXhElements 不抛', async () => {
    const { defineXhElements } = await import('../src/define')
    expect(() => defineXhElements()).not.toThrow()
  })

  it('元素基类在无 DOM 下也能取到', async () => {
    const { XhReactiveElement } = await import('../src/reactive')
    expect(typeof XhReactiveElement).toBe('function')
  })
})
