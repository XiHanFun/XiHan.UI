import { onDiagnostic, resetDiagnostics } from '@xihan-ui/kernel'
// @vitest-environment jsdom
// 命令式服务的宿主挂不起来时，不许把调用方一起拖下水。
//
// 这几个服务是从路由守卫、请求拦截器这类地方懒建的。那些位置抛异常，后果不是
// 「提示没弹出来」而是整次导航失败、整站白屏——而报错指向的是浮层部件，
// 与真正的原因隔着十万八千里。一条轻提示、一根进度条都不该有这个权力。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountServiceHost } from '../src/services/mount-host'

afterEach(() => {
  resetDiagnostics()
  document.body.innerHTML = ''
})

/** 一个挂载必然抛错的假宿主，模拟 inject 断掉那种失败。 */
function brokenApp(): { mount: () => never, unmount: () => void } {
  return {
    mount: () => {
      throw new Error('[xh] LoadingBar 部件必须用在 XhLoadingBarRoot 内')
    },
    unmount: () => {},
  }
}

describe('服务宿主的挂载守卫', () => {
  it('挂得起来时如实交回 true', () => {
    const holder = document.createElement('div')
    document.body.append(holder)
    const app = { mount: vi.fn(), unmount: vi.fn() }

    expect(mountServiceHost(app as never, holder, 'toast')).toBe(true)
    expect(app.mount).toHaveBeenCalledWith(holder)
  })

  it('挂不起来时不抛出去，交回 false', () => {
    const holder = document.createElement('div')
    document.body.append(holder)

    expect(() => mountServiceHost(brokenApp() as never, holder, 'loading-bar')).not.toThrow()
    expect(mountServiceHost(brokenApp() as never, holder, 'loading-bar')).toBe(false)
  })

  it('失败要发一条说得清的诊断，不能静默吞掉', () => {
    const records: Array<{ message: string, detail?: Record<string, unknown> }> = []
    onDiagnostic(r => records.push(r as never))

    const holder = document.createElement('div')
    document.body.append(holder)
    mountServiceHost(brokenApp() as never, holder, 'loading-bar')

    expect(records).toHaveLength(1)
    expect(records[0]!.message).toContain('loading-bar')
    // 原始错误要留在 detail 里，不然真正的破坏就查不下去了
    expect((records[0]!.detail as { error?: Error }).error).toBeInstanceOf(Error)
  })

  it('失败后把容器收走，不在 body 里留空壳', () => {
    const holder = document.createElement('div')
    document.body.append(holder)
    mountServiceHost(brokenApp() as never, holder, 'dialog')

    expect(document.body.contains(holder)).toBe(false)
  })
})
