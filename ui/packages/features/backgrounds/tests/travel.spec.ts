// @vitest-environment jsdom
import type { BackgroundEffect, BackgroundSurface, PointCloud } from '../src/types'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { particlesEffect } from '../src/effects/cloud'
import { sandEffect } from '../src/effects/sand'
import { buildCloudVertex } from '../src/engine/glsl'
import { createBackgroundSurface } from '../src/engine/surface'
import { shapeCloud } from '../src/sources/shape'

/**
 * 判据按「带行进钩子的效果，空点云是合法的一端」写：
 * 第一份点云从无到有入场，对着显示中的形状换成空点云则走完退场才消失；
 * 没有行进钩子的效果一切照旧。
 *
 * jsdom 没有 WebGL2，用一份只记账的上下文替身：
 * 两端在不在从 u_presence 的上传值读，画了多少颗从 drawArrays 的第三个参数读，
 * 起点与终点的位置从 bufferData 的前两次上传读。
 */

interface FakeGl {
  readonly gl: WebGL2RenderingContext
  /** 每次上传的 u_presence，按先后排。 */
  readonly presences: Array<[number, number]>
  /** 每次 drawArrays 画的顶点数，按先后排。 */
  readonly counts: number[]
  /** 每次 bufferData 传的数组，按先后排。 */
  readonly uploads: Float32Array[]
}

function createFakeGl(): FakeGl {
  const record = {
    presences: [] as Array<[number, number]>,
    counts: [] as number[],
    uploads: [] as Float32Array[],
  }
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
    uniform2f: (loc: { name: string }, x: number, y: number) => {
      if (loc.name === 'u_presence')
        record.presences.push([x, y])
    },
    bufferData: (_target: unknown, data: Float32Array) => {
      record.uploads.push(data)
    },
    drawArrays: (_mode: unknown, _first: number, count: number) => {
      record.counts.push(count)
    },
  }
  // 其余调用（绑定、混合、清屏）只需不抛；常量也拿到同一个空函数，没人比较它们
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

function mount(fake: FakeGl, effect: BackgroundEffect): BackgroundSurface {
  const canvas = document.createElement('canvas')
  canvas.getContext = (() => fake.gl) as unknown as HTMLCanvasElement['getContext']
  // resize() 量不到盒子就不画，jsdom 的 clientWidth 恒为 0
  Object.defineProperty(canvas, 'clientWidth', { value: 320 })
  Object.defineProperty(canvas, 'clientHeight', { value: 200 })
  document.body.appendChild(canvas)
  const surface = createBackgroundSurface(canvas, { effect })
  surfaces.push(surface)
  return surface
}

const EMPTY: PointCloud = { count: 0, positions: new Float32Array(0), colors: new Float32Array(0) }

function ring(count = 64): PointCloud {
  return shapeCloud('ring', { count, seed: 1 })
}

describe('点云顶点着色器', () => {
  it('不给 travel 时两份点云之间整体线性插值，不声明 u_presence', () => {
    const source = buildCloudVertex('', 'vec3 displace(vec3 p, float seed, float t) { return p; }')
    expect(source).toContain('vec3 p = mix(a_from, a_to, m);')
    expect(source).not.toContain('u_presence')
  })

  it('给了 travel 就交给它走，颜色进度与可见度都取它输出的', () => {
    const source = buildCloudVertex('', sandEffect.particles!.body, 'vec3 travel() {}')
    expect(source).toContain('uniform vec2 u_presence;')
    expect(source).toContain('travel(a_from, a_to, u_presence, u_morph, a_meta.y, u_time, m, visible)')
    expect(source).not.toContain('mix(a_from, a_to, m)')
    expect(source).toContain('u_alpha * depth * visible')
  })
})

describe('空点云作为一端', () => {
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

  it('第一份点云从无到有：起点借终点的位置，由 travel 自己演入场', () => {
    const fake = createFakeGl()
    const surface = mount(fake, sandEffect)
    const cloud = ring()

    surface.setCloud(cloud, { duration: 0.2 })
    runFrames(2)

    expect(fake.presences.at(-1)).toEqual([0, 1])
    expect(fake.counts.at(-1)).toBe(64)
    // 前两次上传是起点与终点的位置
    expect([...fake.uploads[0]!]).toEqual([...cloud.positions])
    expect([...fake.uploads[1]!]).toEqual([...cloud.positions])
  })

  it('换成空点云：粒子留着走完退场，走完才不再画', () => {
    const fake = createFakeGl()
    const surface = mount(fake, sandEffect)
    surface.setCloud(ring(), { duration: 0 })
    runFrames(2)
    expect(fake.presences.at(-1)).toEqual([0, 1])

    surface.setCloud(EMPTY, { duration: 0.2 })
    runFrames(2)
    // 退场途中粒子数不变，告诉 travel 下一端是空的
    expect(fake.presences.at(-1)).toEqual([1, 0])
    expect(fake.counts.at(-1)).toBe(64)

    // 0.2 秒按每帧 16 毫秒要 13 帧；走完之后一颗都不画
    runFrames(20)
    const drawn = fake.counts.length
    runFrames(5)
    expect(fake.counts.length).toBe(drawn)
  })

  it('退场途中来了新形状：新形状从无到有入场，不接退场那份的位置', () => {
    const fake = createFakeGl()
    const surface = mount(fake, sandEffect)
    surface.setCloud(ring(), { duration: 0 })
    runFrames(2)
    surface.setCloud(EMPTY, { duration: 1 })
    runFrames(2)

    const next = shapeCloud('heart', { count: 48, seed: 2 })
    fake.uploads.length = 0
    surface.setCloud(next, { duration: 1 })
    runFrames(2)

    expect(fake.presences.at(-1)).toEqual([0, 1])
    expect(fake.counts.at(-1)).toBe(48)
    expect([...fake.uploads[0]!]).toEqual([...next.positions])
  })

  it('形状换形状：两端都在，起点是上一份去往的位置', () => {
    const fake = createFakeGl()
    const surface = mount(fake, sandEffect)
    const first = ring(48)
    surface.setCloud(first, { duration: 0 })
    runFrames(2)

    fake.uploads.length = 0
    surface.setCloud(shapeCloud('heart', { count: 48, seed: 2 }), { duration: 1 })
    runFrames(2)

    expect(fake.presences.at(-1)).toEqual([1, 1])
    expect([...fake.uploads[0]!]).toEqual([...first.positions])
  })

  it('减弱动效下退场没有过程可演，换成空点云立即清空', () => {
    setMotionOverride('reduce')
    const fake = createFakeGl()
    const surface = mount(fake, sandEffect)
    surface.setCloud(ring())
    runFrames(2)
    expect(fake.counts.at(-1)).toBe(64)

    surface.setCloud(EMPTY)
    runFrames(1)
    const drawn = fake.counts.length
    runFrames(5)
    expect(fake.counts.length).toBe(drawn)
  })

  it('没有行进钩子的效果照旧：换成空点云立即清空，从不上传 u_presence', () => {
    const fake = createFakeGl()
    const surface = mount(fake, particlesEffect)
    surface.setCloud(ring(), { duration: 0 })
    runFrames(2)
    expect(fake.counts.at(-1)).toBe(64)

    surface.setCloud(EMPTY, { duration: 1 })
    runFrames(1)
    // particles 还有一个全屏底色通道（3 个顶点），粒子通道不再出现
    expect(fake.counts.at(-1)).toBe(3)
    expect(fake.presences).toEqual([])
  })
})
