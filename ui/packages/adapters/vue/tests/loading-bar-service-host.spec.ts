// @vitest-environment jsdom
// 进度条服务的宿主自己渲染那三层，不经 provide/inject 拿 api。
//
// 这棵子树固定且全归服务自己拥有，用上下文传 api 什么也没换来，却把
// 「跨模块 provide/inject 必须对得上」加成了一条本可以没有的前提——
// 模块被加载成两份时那条链会断，而报错指向的是部件本身，查起来极费劲。
import { afterEach, describe, expect, it } from 'vitest'
import { createLoadingBarService } from '../src'

let dispose: (() => void) | null = null

afterEach(() => {
  dispose?.()
  dispose = null
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await new Promise(r => setTimeout(r, 0))
}

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="loading-bar"][data-part="${name}"]`)
}

describe('进度条服务的宿主', () => {
  it('三层部件都挂上，DOM 与组件树内的组合写法一致', async () => {
    const loading = createLoadingBarService()
    dispose = () => loading.dispose()
    await tick()

    const root = part('root')!
    const track = part('track')!
    const range = part('range')!
    expect(root).not.toBeNull()
    // 层级关系与 XhLoadingBarRoot > Track > Range 一样
    expect(root.contains(track)).toBe(true)
    expect(track.contains(range)).toBe(true)
  })

  it('不依赖上下文：宿主里不出现任何部件组件', async () => {
    // 这条守的是实现方式而非表象——部件组件会在渲染期 inject，
    // 而 inject 正是模块重复时会断掉的那一环。宿主直接从 api 渲染就没有这一环。
    const src = await import('node:fs').then(fs =>
      fs.readFileSync('src/services/loading-bar-service.ts', 'utf8'),
    )
    // 查的是依赖而不是字面量：注释里提一嘴组合用法不算依赖
    expect(src.includes(String.raw`from '../components/loading-bar`)).toBe(false)
    expect(src).toContain('connectLoadingBar')
  })

  it('在途计数照常驱动条子', async () => {
    const loading = createLoadingBarService()
    dispose = () => loading.dispose()
    await tick()
    expect(part('root')!.getAttribute('data-state')).not.toBe('loading')

    loading.start()
    await tick()
    expect(part('root')!.getAttribute('data-state')).toBe('loading')

    loading.finishAll()
    await tick()
    expect(part('root')!.getAttribute('data-state')).not.toBe('loading')
  })

  it('切语气：出错收尾与正常收尾分得开', async () => {
    const loading = createLoadingBarService()
    dispose = () => loading.dispose()
    loading.start()
    await tick()
    expect(part('root')!.getAttribute('data-tone')).toBe('brand')

    loading.error()
    await tick()
    expect(part('root')!.getAttribute('data-tone')).toBe('danger')
  })
})
