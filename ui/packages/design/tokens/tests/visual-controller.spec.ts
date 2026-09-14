// @vitest-environment jsdom
import type { VisualEnvironmentController, VisualEnvironmentControllerOptions } from '../src/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  brandId,
  createMotionOverrideSink,
  createThemeController,
  createVisualEnvironmentController,
} from '../src/runtime'

interface MutableMql {
  matches: boolean
  listeners: Set<() => void>
  addEventListener: (_event: 'change', listener: () => void) => void
  removeEventListener: (_event: 'change', listener: () => void) => void
}

function mediaWindow(): { win: Window, queries: Record<string, MutableMql> } {
  const queries: Record<string, MutableMql> = {}
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value(query: string) {
      return queries[query] ??= {
        matches: false,
        listeners: new Set(),
        addEventListener: (_event: 'change', listener: () => void) => void queries[query]!.listeners.add(listener),
        removeEventListener: (_event: 'change', listener: () => void) => void queries[query]!.listeners.delete(listener),
      }
    },
  })
  return { win: window, queries }
}

function change(query: MutableMql, matches: boolean): void {
  query.matches = matches
  for (const listener of [...query.listeners])
    listener()
}

const controllers: VisualEnvironmentController[] = []

afterEach(() => {
  for (const controller of controllers.splice(0))
    controller.dispose()
  document.body.innerHTML = ''
  localStorage.clear()
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('visualEnvironmentController', () => {
  it('一次 set 在同一 scope 提交完整七轴且只通知一次', () => {
    const root = document.createElement('section')
    document.body.append(root)
    const controller = createVisualEnvironmentController({ root })
    controllers.push(controller)
    const states = vi.fn()
    controller.subscribe(states)

    controller.setPreference({
      mode: 'dark',
      brand: brandId('acme'),
      density: 'compact',
      dir: 'rtl',
      contrast: 'more',
      motion: 'reduce',
      transparency: 'reduce',
    })

    expect(states).toHaveBeenCalledTimes(1)
    expect([...root.attributes].map(attr => [attr.name, attr.value])).toEqual([
      ['data-theme', 'dark'],
      ['data-brand', 'acme'],
      ['data-density', 'compact'],
      ['data-contrast', 'more'],
      ['data-motion', 'reduce'],
      ['data-transparency', 'reduce'],
      ['dir', 'rtl'],
    ])
  })

  it('嵌套作用域继承父状态，显式 undefined 清除覆盖并恢复继承', () => {
    const outer = document.createElement('section')
    const inner = document.createElement('div')
    outer.append(inner)
    document.body.append(outer)
    const parent = createVisualEnvironmentController({ root: outer, initial: { mode: 'dark', motion: 'reduce' } })
    const child = createVisualEnvironmentController({ root: inner, parent, initial: { mode: 'light' } })
    controllers.push(child, parent)

    parent.setPreference({ density: 'compact', mode: 'light' })
    expect(child.getState()).toMatchObject({ mode: 'light', density: 'compact', motion: 'reduce' })
    child.setPreference({ mode: 'dark' })
    child.setPreference({ mode: undefined })
    expect(child.getPreference()).not.toHaveProperty('mode')
    expect(child.getState().mode).toBe('light')
  })

  it('只让四个真实系统轴响应媒体变化', () => {
    const { win, queries } = mediaWindow()
    const root = document.createElement('section')
    const controller = createVisualEnvironmentController({
      root,
      win,
      initial: { mode: 'system', contrast: 'system', motion: 'system', transparency: 'system' },
    })
    controllers.push(controller)
    change(queries['(prefers-color-scheme: dark)']!, true)
    change(queries['(prefers-contrast: more)']!, true)
    change(queries['(prefers-reduced-motion: reduce)']!, true)
    change(queries['(prefers-reduced-transparency: reduce)']!, true)
    expect(controller.getState()).toMatchObject({
      mode: 'dark',
      contrast: 'more',
      motion: 'reduce',
      transparency: 'reduce',
      brand: 'xihan',
      density: 'comfortable',
      dir: 'ltr',
    })
  })

  it('局部 scope 禁止注入全局 motion sink；根 scope 同步并在 dispose 释放', () => {
    const local = document.createElement('section')
    expect(() => createVisualEnvironmentController({ root: local, motionSink: vi.fn() })).toThrow(/documentElement/)

    const sink = vi.fn()
    const rootController = createVisualEnvironmentController({
      root: document.documentElement,
      initial: { motion: 'reduce' },
      motionSink: sink,
    })
    expect(sink).toHaveBeenLastCalledWith('reduce')
    rootController.dispose()
    expect(sink).toHaveBeenLastCalledWith(null)
  })

  it('显式 motion sink 把 default 映成 no-preference，并原样释放 null', () => {
    const override = vi.fn()
    const sink = createMotionOverrideSink(override)
    sink('default')
    sink('reduce')
    sink(null)
    expect(override.mock.calls).toEqual([['no-preference'], ['reduce'], [null]])
  })

  it('dispose 恢复控制器接管前的七轴 DOM', () => {
    const root = document.createElement('section')
    root.setAttribute('data-theme', 'dark')
    root.setAttribute('data-motion', 'reduce')
    const controller = createVisualEnvironmentController({ root, initial: { mode: 'light' } })
    controller.dispose()
    expect(root.getAttribute('data-theme')).toBe('dark')
    expect(root.getAttribute('data-motion')).toBe('reduce')
    expect(root.hasAttribute('data-brand')).toBe(false)
  })

  it('使用 root 所属 realm，并拒绝交叉 realm', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const foreignDocument = iframe.contentDocument!
    const foreignWindow = iframe.contentWindow!
    const foreignRoot = foreignDocument.createElement('main')
    foreignDocument.body.append(foreignRoot)
    const controller = createVisualEnvironmentController({ root: foreignRoot })
    expect(foreignRoot.getAttribute('data-theme')).toBe('light')
    controller.dispose()
    expect(() => createVisualEnvironmentController({ root: foreignRoot, win: window })).toThrow(/realm/)
    expect(foreignWindow).not.toBe(window)
  })

  it('root 的 Document 没有 defaultView 时使用 SSR 环境，不借 ambient window', () => {
    const detachedDocument = document.implementation.createHTMLDocument('detached')
    const detachedRoot = detachedDocument.documentElement
    const ambientMatchMedia = vi.fn()
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: ambientMatchMedia })
    const controller = createVisualEnvironmentController({
      root: detachedRoot,
      initial: { mode: 'system', motion: 'system' },
    })
    expect(controller.getState()).toMatchObject({ mode: 'light', motion: 'default' })
    expect(ambientMatchMedia).not.toHaveBeenCalled()
    expect(() => createVisualEnvironmentController({ root: detachedRoot, win: window })).toThrow(/realm/)
    controller.dispose()
  })

  it('持久化必须声明错误出口；读写失败均显式报告且内存状态继续生效', () => {
    // @ts-expect-error storageKey 与 onStorageError 是一组判别联合，不能只传前者
    const invalidStorageOptions: VisualEnvironmentControllerOptions = { storageKey: 'xh-visual' }
    expect(() => createVisualEnvironmentController(invalidStorageOptions as never)).toThrow(/onStorageError/)
    localStorage.setItem('xh-visual', '{bad')
    const errors = vi.fn()
    const controller = createVisualEnvironmentController({ storageKey: 'xh-visual', onStorageError: errors })
    controllers.push(controller)
    expect(errors).toHaveBeenCalledWith(expect.objectContaining({ operation: 'read', key: 'xh-visual' }))

    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    controller.setPreference({ mode: 'dark' })
    expect(controller.getState().mode).toBe('dark')
    expect(errors).toHaveBeenCalledWith(expect.objectContaining({ operation: 'write', key: 'xh-visual' }))
    write.mockRestore()
  })

  it('createThemeController 复用七轴控制器并保持五轴视图', () => {
    const root = document.createElement('section')
    const parent = createThemeController({ root, initial: { mode: 'dark' } })
    const child = createThemeController({ root: document.createElement('div'), parent })
    expect(child.getState()).toEqual(expect.objectContaining({ mode: 'dark', contrast: 'default' }))
    expect(child.getState()).not.toHaveProperty('motion')
    child.dispose()
    parent.dispose()
  })
})
