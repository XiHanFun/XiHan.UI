import type { HighlighterPort } from '@xihan-ui/core'
import type { CodeViewHighlighterModule } from '../src/code-view'
import { describe, expect, it, vi } from 'vitest'
import { createCodeViewHighlighterResource, isCodeViewHighlighterUnavailable } from '../src/code-view'

const HIGHLIGHTER: HighlighterPort = { highlight: () => [] }

async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('codeView 默认高亮资源', () => {
  it('并发请求只加载和初始化一次，结果缓存并通知全部在场订阅者', async () => {
    let resolveModule: ((module: CodeViewHighlighterModule) => void) | undefined
    const load = vi.fn(() => new Promise<CodeViewHighlighterModule>((resolve) => {
      resolveModule = resolve
    }))
    const createHighlighter = vi.fn(() => HIGHLIGHTER)
    const first = vi.fn()
    const second = vi.fn()
    const resource = createCodeViewHighlighterResource(load)
    resource.subscribe(first)
    resource.subscribe(second)

    resource.request()
    resource.request()
    expect(load).toHaveBeenCalledTimes(1)
    expect(resource.read()).toBeNull()

    resolveModule?.({ createHighlighter })
    await settle()
    expect(createHighlighter).toHaveBeenCalledTimes(1)
    expect(resource.read()).toBe(HIGHLIGHTER)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)

    resource.request()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('取消订阅后不再通知该实例', async () => {
    const listener = vi.fn()
    const resource = createCodeViewHighlighterResource(async () => ({ createHighlighter: () => HIGHLIGHTER }))
    const unsubscribe = resource.subscribe(listener)
    unsubscribe()

    resource.request()
    await settle()
    expect(listener).not.toHaveBeenCalled()
  })

  it('默认可选模块明确缺席时缓存纯文本能力边界，不抛错也不重试', async () => {
    const error = Object.assign(new Error('Cannot find package \'@xihan-ui/code-highlight\''), { code: 'ERR_MODULE_NOT_FOUND' })
    const load = vi.fn(async (): Promise<CodeViewHighlighterModule> => {
      throw error
    })
    const resource = createCodeViewHighlighterResource(load)

    resource.request()
    await settle()
    expect(resource.read()).toBeNull()
    resource.request()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('模块请求的非缺席异常保留原因，并在读取时抛出', async () => {
    const error = new Error('network failed')
    const resource = createCodeViewHighlighterResource(async () => {
      throw error
    })

    resource.request()
    await settle()
    expect(() => resource.read()).toThrow(error)
  })

  it('已安装模块的初始化异常不按可选能力缺席吞掉', async () => {
    const error = new Error('highlighter init failed')
    const createHighlighter = vi.fn(() => {
      throw error
    })
    const resource = createCodeViewHighlighterResource(async () => ({ createHighlighter }))

    resource.request()
    await settle()
    expect(createHighlighter).toHaveBeenCalledTimes(1)
    expect(() => resource.read()).toThrow(error)
  })
})

describe('isCodeViewHighlighterUnavailable', () => {
  it('只认明确指向默认 peer 的模块解析失败', () => {
    expect(isCodeViewHighlighterUnavailable(new Error('Cannot find package \'@xihan-ui/code-highlight\''))).toBe(true)
    expect(isCodeViewHighlighterUnavailable(new Error('Failed to resolve module specifier \'@xihan-ui/code-highlight\''))).toBe(true)
    expect(isCodeViewHighlighterUnavailable(new Error('loader wrapper', {
      cause: new Error('Cannot find module \'@xihan-ui/code-highlight\''),
    }))).toBe(true)
    expect(isCodeViewHighlighterUnavailable(new Error('highlighter init failed'))).toBe(false)
    expect(isCodeViewHighlighterUnavailable(new Error('Cannot find package \'@xihan-ui/other\''))).toBe(false)
  })
})
