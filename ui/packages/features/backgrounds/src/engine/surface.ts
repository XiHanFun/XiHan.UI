// 视觉画面：负责画布、上下文、两个绘制通道、点云缓冲与整套生命周期。
//
// 两个通道：流场通道跑效果的片元着色器，粒子通道画 gl.POINTS。
// 粒子有两种来源——程序化（位置由粒子序号在顶点着色器里算出，不占缓冲）
// 与点云（位置来自顶点缓冲，两份点云之间可插值），效果自己声明用哪种。
//
// 片元着色器一律输出预乘 alpha，画布因此可以是半透明的，铺在组件背景上不挡住底下的内容。

import type {
  BackgroundEffect,
  BackgroundQuality,
  BackgroundSurface,
  BackgroundSurfaceOptions,
  EffectContext,
  MorphOptions,
  ParamValue,
  ParamValues,
  PointCloud,
  UniformMap,
} from '../types'
import type { GlProgram } from './program'
import { DIAGNOSTIC_CODES, isSSR, reportDiagnostic } from '@xihan-ui/kernel'
import { onMotionPreferenceChange, resolveMotionPreference } from '@xihan-ui/motion'
import { resolveEffect } from '../effects/registry'
import { num, resolveParams } from '../params'
import { createRng, lerpArrays, resample, scatterShell } from '../sources/cloud'
import {
  buildCloudVertex,
  buildFragment,
  buildProceduralVertex,
  FRAG_POINT,
  VERT_QUAD,
} from './glsl'
import { createProgram } from './program'
import { joinScheduler } from './scheduler'

interface QualityProfile {
  readonly dpr: number
  readonly particles: number
}

const PROFILES: Record<Exclude<BackgroundQuality, 'auto'>, QualityProfile> = {
  high: { dpr: 2, particles: 1 },
  balanced: { dpr: 1.5, particles: 0.7 },
  eco: { dpr: 1, particles: 0.4 },
}

/** auto 档：按核数与像素比粗判。判错的代价只是画面糙一点或费一点，不值得做真实测帧。 */
function autoProfile(): QualityProfile {
  const cores = typeof navigator === 'undefined' ? 4 : (navigator.hardwareConcurrency ?? 4)
  const dpr = typeof window === 'undefined' ? 1 : (window.devicePixelRatio ?? 1)
  if (cores <= 4)
    return PROFILES.eco
  if (cores >= 8 && dpr <= 2)
    return PROFILES.high
  return PROFILES.balanced
}

function profileOf(quality: BackgroundQuality): QualityProfile {
  return quality === 'auto' ? autoProfile() : PROFILES[quality]
}

const CLOUD_ATTRIBUTES = ['a_from', 'a_to', 'a_colorFrom', 'a_colorTo', 'a_meta'] as const
const CLOUD_STRIDES = [3, 3, 3, 3, 2] as const

// z-index:-1 是「浮在效果之上」那句承诺的落点：画布是宿主的最后一个子节点，
// 不给层号就按绘制顺序压在常规流内容之上。负层号把它排到内容之前、宿主自身背景之后，
// 再配上宿主的 isolation:isolate，这个负层号也逃不到宿主外面去。
const CANVAS_CSS = 'position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none;z-index:-1'

/**
 * 把画布挂到宿主上，并保证宿主是它的定位祖先。返回撤销观察的函数。
 *
 * 宿主已带非 static 定位就直接挂；量到 static 才写一句内联 relative。
 * 宿主还没进文档时两者都判不出来（getComputedStyle 此时什么都算不出），
 * 这时**不挂也不写**：不在文档树里的画布逃不到别的祖先上，宿主的定位也就不必现在定。
 * 宿主进文档拿到盒子的那一刻 ResizeObserver 响一次，届时再定。
 */
function attachCanvas(host: HTMLElement, canvas: HTMLCanvasElement): () => void {
  canvas.style.cssText = CANVAS_CSS
  let attached = false

  function settle(): boolean {
    if (attached)
      return true
    const inline = host.style.position
    if (inline === '' || inline === 'static') {
      if (!host.isConnected)
        return false
      // 空串按 static 处理：算不出定位的环境（如不实现该属性的测试环境）同样需要兜底
      const computed = getComputedStyle(host).position
      if (computed === '' || computed === 'static')
        host.style.position = 'relative'
    }
    // 负层号的画布必须关在宿主里，否则它会钻到宿主自己的背景之下、甚至更外层去
    host.style.isolation = 'isolate'
    host.appendChild(canvas)
    attached = true
    return true
  }

  if (settle())
    return (): void => {}

  // 构造器从 host 自己的文档取：跨 iframe 时全局的那个来自另一个 window，
  // 拿它去 observe 别的文档里的节点，回调一次都不会来
  const view = host.ownerDocument?.defaultView

  // 没有 ResizeObserver 就没有第二次机会，退回「先写下兜底定位」
  if (typeof view?.ResizeObserver !== 'function') {
    host.style.position = 'relative'
    host.style.isolation = 'isolate'
    host.appendChild(canvas)
    attached = true
    return (): void => {}
  }

  const observer = new view.ResizeObserver(() => {
    if (settle())
      observer.disconnect()
  })
  observer.observe(host)
  return (): void => observer.disconnect()
}

/**
 * 建一张视觉画面。
 *
 * target 传容器元素时内部会插一张铺满的画布并设为 pointer-events: none，
 * 所以它永远不会挡住宿主组件自己的交互；指针事件监听在容器上。
 * 容器量出来是 static 时会被写一句内联 position: relative，否则绝对定位的画布会跑到别的祖先上去；
 * 容器自己已有定位（含用类名写的）则一个字都不动。
 */
export function createBackgroundSurface(
  target: HTMLElement,
  options: BackgroundSurfaceOptions,
): BackgroundSurface {
  if (isSSR())
    throw new Error('[backgrounds] createBackgroundSurface 需要 DOM，请在客户端调用')

  let effect = resolveEffect(options.effect)
  /**
   * 只记用户显式设过的值。换效果时拿它重算参数，
   * 若改为沿用上一个效果解析后的整份参数，用户没碰过的项会把上一个效果的默认值带过去
   * ——换到 grain 却继承了 mesh 的不透明度 1，噪点浓得完全不像它的默认样子。
   */
  let overrides: Record<string, ParamValue> = { ...options.params }
  let params = resolveParams(effect.params, overrides)
  let quality: BackgroundQuality = options.quality ?? 'auto'
  let profile = profileOf(quality)

  const ownsCanvas = !(target instanceof HTMLCanvasElement)
  const canvas = ownsCanvas ? document.createElement('canvas') : target
  const host = target

  const detachCanvas = ownsCanvas ? attachCanvas(host, canvas) : (): void => {}

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  })

  if (gl === null) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      message: '[backgrounds] 当前环境不支持 WebGL2，已降级为静态背景',
    })
    return createFallbackSurface(canvas, ownsCanvas, effect, overrides, detachCanvas)
  }

  const context = gl

  let backgroundProgram: GlProgram | null = null
  let particleProgram: GlProgram | null = null
  let proceduralCount = 0

  let vao: WebGLVertexArrayObject | null = null
  let cloudBuffers: WebGLBuffer[] = []
  let cloudCount = 0
  let fromPositions: Float32Array = new Float32Array(0)
  let toPositions: Float32Array = new Float32Array(0)
  let fromColors: Float32Array = new Float32Array(0)
  let toColors: Float32Array = new Float32Array(0)
  let morph = 1
  let morphRate = 0
  /** 留着上一份点云：重建着色器程序会让 VAO 里的属性位置失效，必须照原样重传一次。 */
  let lastCloud: PointCloud | null = null

  let width = 0
  let height = 0
  let renderScale = 1
  let time = 0
  let playing = options.autoplay !== false
  let visible = true
  let dirty = true
  let disposed = false
  let contextLost = false

  const pointer: [number, number] = [0.5, 0.5]
  let pointerAmount = 0
  let pointerTarget = 0

  const respectReducedMotion = options.respectReducedMotion !== false
  let reduced = respectReducedMotion && resolveMotionPreference() === 'reduce'

  function buildPrograms(): void {
    backgroundProgram?.dispose()
    particleProgram?.dispose()
    backgroundProgram = null
    particleProgram = null
    proceduralCount = 0

    const shared = effect.shared ?? ''

    if (effect.fragment !== undefined)
      backgroundProgram = createProgram(context, VERT_QUAD, buildFragment(shared, effect.fragment), `${effect.name}/bg`)

    const spec = effect.particles
    if (spec !== undefined) {
      const vertex = spec.mode === 'cloud'
        ? buildCloudVertex(shared, spec.body)
        : buildProceduralVertex(shared, spec.body)
      particleProgram = createProgram(context, vertex, FRAG_POINT, `${effect.name}/points`)
      if (spec.mode === 'procedural') {
        const raw = typeof spec.count === 'function' ? spec.count(params) : spec.count
        proceduralCount = Math.max(0, Math.round(raw * profile.particles))
      }
      else if (lastCloud !== null) {
        cloudCount = 0
        uploadCloud(lastCloud, { duration: 0 })
      }
    }
    dirty = true
  }

  /** 点云缓冲重建。数量变了就整套重来，重建频率远低于每帧，不值得做增量。 */
  function uploadCloud(next: PointCloud, morphOptions?: MorphOptions): void {
    lastCloud = next
    const count = next.count
    if (count === 0) {
      cloudCount = 0
      dirty = true
      return
    }

    const previousPositions = cloudCount === 0
      ? scatterShell(count, 1.7, Math.round(num(params, 'seed')) + 7)
      : resample(lerpArrays(fromPositions, toPositions, smoothstep(morph)), cloudCount, count, 3)
    const previousColors = cloudCount === 0
      ? resample(next.colors, count, count, 3)
      : resample(lerpArrays(fromColors, toColors, smoothstep(morph)), cloudCount, count, 3)

    fromPositions = previousPositions
    toPositions = new Float32Array(count * 3)
    toPositions.set(next.positions.subarray(0, count * 3))
    fromColors = previousColors
    toColors = new Float32Array(count * 3)
    toColors.set(next.colors.subarray(0, count * 3))

    const rng = createRng(Math.round(num(params, 'seed')) + 13)
    const meta = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      meta[i * 2] = next.sizes?.[i] ?? 1
      meta[i * 2 + 1] = rng()
    }

    const duration = morphOptions?.duration ?? (cloudCount === 0 ? 1.4 : 1.1)
    morph = duration <= 0 ? 1 : 0
    morphRate = duration <= 0 ? 0 : 1 / duration
    cloudCount = count

    disposeCloudBuffers()
    vao = context.createVertexArray()
    context.bindVertexArray(vao)
    const data = [fromPositions, toPositions, fromColors, toColors, meta]
    cloudBuffers = []
    for (let i = 0; i < CLOUD_ATTRIBUTES.length; i++) {
      const buffer = context.createBuffer()
      if (buffer === null)
        continue
      cloudBuffers.push(buffer)
      context.bindBuffer(context.ARRAY_BUFFER, buffer)
      context.bufferData(context.ARRAY_BUFFER, data[i]!, context.STATIC_DRAW)
      const location = particleProgram?.attrib(CLOUD_ATTRIBUTES[i]!) ?? -1
      if (location >= 0) {
        context.enableVertexAttribArray(location)
        context.vertexAttribPointer(location, CLOUD_STRIDES[i]!, context.FLOAT, false, 0, 0)
      }
    }
    context.bindVertexArray(null)
    dirty = true
  }

  function disposeCloudBuffers(): void {
    for (const buffer of cloudBuffers)
      context.deleteBuffer(buffer)
    cloudBuffers = []
    if (vao !== null)
      context.deleteVertexArray(vao)
    vao = null
  }

  function smoothstep(x: number): number {
    const t = Math.min(1, Math.max(0, x))
    return t * t * (3 - 2 * t)
  }

  function resize(): boolean {
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight
    if (cssWidth <= 0 || cssHeight <= 0)
      return false
    const dpr = Math.min(typeof window === 'undefined' ? 1 : (window.devicePixelRatio ?? 1), profile.dpr)
    renderScale = dpr * (effect.scale ?? 1)
    const nextWidth = Math.max(1, Math.round(cssWidth * renderScale))
    const nextHeight = Math.max(1, Math.round(cssHeight * renderScale))
    if (nextWidth !== width || nextHeight !== height) {
      width = nextWidth
      height = nextHeight
      canvas.width = width
      canvas.height = height
      context.viewport(0, 0, width, height)
      dirty = true
    }
    return true
  }

  function uploadUniforms(program: GlProgram, extra: UniformMap): void {
    program.uniform('u_resolution', [width, height])
    program.uniform('u_time', time)
    program.uniform('u_pointer', pointer)
    program.uniform('u_pointerAmt', pointerAmount)
    program.uniform('u_px', renderScale)
    for (const key of Object.keys(extra))
      program.uniform(key, extra[key]!)
  }

  function draw(): void {
    const ctx: EffectContext = { params, width, height, time }
    const extra = effect.uniforms?.(ctx) ?? {}

    context.clearColor(0, 0, 0, 0)
    context.clear(context.COLOR_BUFFER_BIT)

    if (backgroundProgram !== null) {
      context.disable(context.BLEND)
      context.useProgram(backgroundProgram.handle)
      uploadUniforms(backgroundProgram, extra)
      context.drawArrays(context.TRIANGLES, 0, 3)
    }

    const spec = effect.particles
    if (particleProgram === null || spec === undefined)
      return

    const drawCount = spec.mode === 'cloud' ? cloudCount : proceduralCount
    if (drawCount <= 0)
      return

    context.enable(context.BLEND)
    /* 颜色已预乘 alpha：加性发光用 ONE，常规叠加用 1-src_alpha */
    context.blendFunc(context.ONE, spec.blend === 'normal' ? context.ONE_MINUS_SRC_ALPHA : context.ONE)
    context.useProgram(particleProgram.handle)
    uploadUniforms(particleProgram, extra)
    if (spec.mode === 'cloud') {
      particleProgram.uniform('u_morph', morph)
      context.bindVertexArray(vao)
      context.drawArrays(context.POINTS, 0, drawCount)
      context.bindVertexArray(null)
    }
    else {
      context.drawArrays(context.POINTS, 0, drawCount)
    }
    context.disable(context.BLEND)
  }

  /**
   * 浏览器每个页面能同时持有的 WebGL 上下文有上限（各家在 16 上下），超了就把最早的那些丢掉。
   * 不 preventDefault，浏览器根本不会尝试恢复；不重建程序，恢复回来的上下文里什么资源都没有。
   */
  function onContextLost(event: Event): void {
    event.preventDefault()
    contextLost = true
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      message: `[backgrounds] WebGL 上下文丢失（${effect.name}）。同一页面上的画面过多时最早创建的会被丢弃，用不到的请及时 destroy()`,
    })
  }

  function onContextRestored(): void {
    contextLost = false
    backgroundProgram = null
    particleProgram = null
    disposeCloudBuffers()
    cloudCount = 0
    buildPrograms()
    width = 0
    height = 0
    dirty = true
  }

  function tick(dt: number): void {
    if (disposed || contextLost || !playing || !visible)
      return

    if (pointerAmount !== pointerTarget) {
      const k = dt > 0 ? Math.min(dt * 5, 1) : 1
      pointerAmount += (pointerTarget - pointerAmount) * k
      if (Math.abs(pointerTarget - pointerAmount) < 0.002)
        pointerAmount = pointerTarget
      dirty = true
    }

    const step = reduced ? 0 : dt
    if (step === 0 && !dirty && morph >= 1)
      return
    if (!resize())
      return

    time += step
    if (morph < 1 && morphRate > 0)
      morph = Math.min(1, morph + step * morphRate)

    draw()
    dirty = false
  }

  function onPointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      return
    pointer[0] = (event.clientX - rect.left) / rect.width
    pointer[1] = 1 - (event.clientY - rect.top) / rect.height
    pointerTarget = 1
    dirty = true
  }

  function onPointerLeave(): void {
    pointerTarget = 0
  }

  buildPrograms()

  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)

  if (options.pointer !== false) {
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerdown', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)
  }

  let observer: IntersectionObserver | null = null
  // 构造器同样从画布所在文档取，理由与上面那处 ResizeObserver 一致
  const canvasView = canvas.ownerDocument?.defaultView
  if (options.pauseOffscreen !== false && typeof canvasView?.IntersectionObserver === 'function') {
    observer = new canvasView.IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
      dirty = true
    }, { rootMargin: '160px' })
    observer.observe(canvas)
  }

  const stopReducedMotion = respectReducedMotion
    ? onMotionPreferenceChange((value) => {
        reduced = value === 'reduce'
        dirty = true
      })
    : (): void => {}

  const leaveScheduler = joinScheduler({ tick })

  const surface: BackgroundSurface = {
    canvas,
    backend: 'webgl2',
    get effect(): BackgroundEffect {
      return effect
    },
    get playing(): boolean {
      return playing
    },
    setEffect(next: BackgroundEffect | string): void {
      const resolved = resolveEffect(next)
      if (resolved === effect)
        return
      effect = resolved
      // 用户设过的值按新效果的规格重解析：新效果没有的键会被丢掉，同名的留下来
      params = resolveParams(effect.params, overrides)
      disposeCloudBuffers()
      cloudCount = 0
      buildPrograms()
      width = 0
      height = 0
    },
    setParams(patch: Readonly<Record<string, ParamValue>>): void {
      overrides = { ...overrides, ...patch }
      params = resolveParams(effect.params, overrides)
      const spec = effect.particles
      if (spec !== undefined && spec.mode === 'procedural') {
        const raw = typeof spec.count === 'function' ? spec.count(params) : spec.count
        proceduralCount = Math.max(0, Math.round(raw * profile.particles))
      }
      dirty = true
    },
    getParams(): ParamValues {
      return { ...params }
    },
    setQuality(next: BackgroundQuality): void {
      quality = next
      profile = profileOf(quality)
      disposeCloudBuffers()
      cloudCount = 0
      buildPrograms()
      width = 0
      height = 0
    },
    setPointer(x: number, y: number, active = true): void {
      pointer[0] = x
      pointer[1] = y
      pointerTarget = active ? 1 : 0
      dirty = true
    },
    setCloud(cloud: PointCloud, morphOptions?: MorphOptions): void {
      if (effect.particles?.mode !== 'cloud') {
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.warn,
          level: 'warn',
          message: `[backgrounds] 效果 ${effect.name} 不使用点云，setCloud 被忽略`,
        })
        return
      }
      uploadCloud(cloud, morphOptions)
    },
    play(): void {
      playing = true
      dirty = true
    },
    pause(): void {
      playing = false
    },
    resize(): void {
      width = 0
      height = 0
      dirty = true
    },
    destroy(): void {
      if (disposed)
        return
      disposed = true
      leaveScheduler()
      stopReducedMotion()
      observer?.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      if (options.pointer !== false) {
        host.removeEventListener('pointermove', onPointerMove)
        host.removeEventListener('pointerdown', onPointerMove)
        host.removeEventListener('pointerleave', onPointerLeave)
      }
      disposeCloudBuffers()
      backgroundProgram?.dispose()
      particleProgram?.dispose()
      context.getExtension('WEBGL_lose_context')?.loseContext()
      detachCanvas()
      if (ownsCanvas)
        canvas.remove()
    },
  }

  return surface
}

/** WebGL2 缺席时的降级：画布退化成一层静态渐变，接口保持一致。 */
function createFallbackSurface(
  canvas: HTMLCanvasElement,
  ownsCanvas: boolean,
  initialEffect: BackgroundEffect,
  initialOverrides: Record<string, ParamValue>,
  detachCanvas: () => void,
): BackgroundSurface {
  let effect = initialEffect
  let overrides = initialOverrides
  let params = resolveParams(effect.params, overrides)

  function paint(): void {
    canvas.style.background = effect.fallback?.(params) ?? 'transparent'
  }
  paint()

  return {
    canvas,
    backend: 'css',
    get effect(): BackgroundEffect {
      return effect
    },
    playing: false,
    setEffect(next: BackgroundEffect | string): void {
      effect = resolveEffect(next)
      params = resolveParams(effect.params, overrides)
      paint()
    },
    setParams(patch: Readonly<Record<string, ParamValue>>): void {
      overrides = { ...overrides, ...patch }
      params = resolveParams(effect.params, overrides)
      paint()
    },
    getParams: (): ParamValues => ({ ...params }),
    setQuality: (): void => {},
    setPointer: (): void => {},
    setCloud: (): void => {},
    play: (): void => {},
    pause: (): void => {},
    resize: (): void => {},
    destroy(): void {
      detachCanvas()
      if (ownsCanvas)
        canvas.remove()
      else
        canvas.style.background = ''
    },
  }
}
