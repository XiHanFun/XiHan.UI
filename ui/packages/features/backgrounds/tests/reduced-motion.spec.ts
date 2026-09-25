// @vitest-environment jsdom
import type { BackgroundSurface } from '../src/types'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { particlesEffect } from '../src/effects/cloud'
import { createBackgroundSurface } from '../src/engine/surface'
import { shapeCloud } from '../src/sources/shape'

/**
 * 判据按「减弱动效下点云形变不能卡在半路」写：
 * 换点云要一步落到新形状，落完之后调度循环必须闲下来，不再每帧空画。
 *
 * jsdom 没有 WebGL2，这里用一份只记账的上下文替身：
 * 形变进度从 u_morph 的上传值读，重画次数从 drawArrays 的调用数读。
 */

interface FakeGl {
  readonly gl: WebGL2RenderingContext
  /** 每次上传的 u_morph，按先后排。 */
  readonly morphs: number[]
  /** drawArrays 被调的次数，一帧画了就至少加一。 */
  draws: number
}

function createFakeGl(): FakeGl {
  const record = { morphs: [] as number[], draws: 0 }
  const handles = {
    createShader: () => ({}),
    createProgram: () => ({}),
    createBuffer: () => ({}),
    createVertexArray: () => ({}),
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getUniformLocation: (_program: unknown, name: string) => ({ name }),
    getAttribLocation: () => 0,
    getExtension: () => null,
    uniform1f: (loc: { name: string }, value: number) => {
      if (loc.name === 'u_morph')
        record.morphs.push(value)
    },
    drawArrays: () => {
      record.draws++
    },
  }
  // 其余调用（绑定、上传、混合、清屏）只需不抛；常量也拿到同一个空函数，没人比较它们
  const noop = (): void => {}
  const gl = new Proxy(handles, {
    get: (target, key) => (key in target ? target[key as keyof typeof target] : noop),
  })
  return Object.assign(record, { gl: gl as unknown as WebGL2RenderingContext })
}

/** 手动推进的帧：调度器每帧先排下一帧，所以队列里始终只有一条回调。 */
let pending: FrameRequestCallback[] = []
let now = 0

function runFrames(count: number): void {
  for (let i = 0; i < count; i++) {
    const callbacks = pending
    pending = []
    now += 16
    for (const callback of callbacks)
      callback(now)
  }
}

const surfaces: BackgroundSurface[] = []

function mount(fake: FakeGl): BackgroundSurface {
  const canvas = document.createElement('canvas')
  canvas.getContext = (() => fake.gl) as unknown as HTMLCanvasElement['getContext']
  // resize() 量不到盒子就不画，jsdom 的 clientWidth 恒为 0
  Object.defineProperty(canvas, 'clientWidth', { value: 320 })
  Object.defineProperty(canvas, 'clientHeight', { value: 200 })
  document.body.appendChild(canvas)
  const surface = createBackgroundSurface(canvas, { effect: particlesEffect })
  surfaces.push(surface)
  return surface
}

function lastMorph(fake: FakeGl): number | undefined {
  return fake.morphs.at(-1)
}

describe('减弱动效下的点云形变', () => {
  beforeEach(() => {
    pending = []
    now = 0
    let id = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      pending.push(callback)
      return ++id
    })
    vi.stubGlobal('cancelAnimationFrame', () => {
      pending = []
    })
  })

  afterEach(() => {
    for (const surface of surfaces.splice(0))
      surface.destroy()
    setMotionOverride(null)
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('换点云直接落到新形状，落完不再重画', () => {
    setMotionOverride('reduce')
    const fake = createFakeGl()
    const surface = mount(fake)
    runFrames(1)

    surface.setCloud(shapeCloud('ring', { count: 64, seed: 1 }))
    runFrames(1)
    expect(lastMorph(fake)).toBe(1)

    const draws = fake.draws
    runFrames(5)
    expect(fake.draws).toBe(draws)
  })

  it('形变途中切到减弱动效，立即收尾并停下', () => {
    const fake = createFakeGl()
    const surface = mount(fake)
    runFrames(1)

    surface.setCloud(shapeCloud('ring', { count: 64, seed: 1 }))
    runFrames(3)
    // 前提：形变确实在半路，而不是一换就到位
    const midway = lastMorph(fake)!
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(1)

    setMotionOverride('reduce')
    runFrames(1)
    expect(lastMorph(fake)).toBe(1)

    const draws = fake.draws
    runFrames(5)
    expect(fake.draws).toBe(draws)
  })
})
