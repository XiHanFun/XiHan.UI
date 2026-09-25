/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 液态面：data-material="liquid" 下浮在内容之上的导航层部件，由组件把自己的部件挂进来。
//
// 皮肤给出完整可用的静态液态面（色调随主题、不透明度取可读下限）。挂进来的部件多三样东西：
//
//   下层判定  滚动、缩放、挂载时读部件下面压着什么，写 data-xh-ink（黑墨 / 白墨域，即浅 / 深色调）
//             与 data-xh-liquid-clarity（均匀下层换通透档）
//   光源方向  细指针移动时把指向指针的单位向量写进 --xh-_liquid-light-x / -y，1px 亮边随之转到朝指针的一侧；
//             减弱动效与粗指针下不跟随，光源留在皮肤缺省的左上方
//   边缘折射  Chromium 内核下把部件的 backdrop-filter 换成一段 SVG 位移滤镜
//
// 同一文档里的部件共用一套监听与按帧调度；材质轴不是 liquid 时部件留在原样，写过的东西随时撤回。
// 撤出最后一个部件时整套监听拆掉，滤镜库一并移除。

import type { LiquidTone } from './reading'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { ensureLens, lensLibrary, MAX_REFRACT_HEIGHT, MAX_REFRACT_WIDTH, parseBackdrop, supportsRefraction } from './lens'
import { lightDirection, readBackdrop, relativeLuminance, sampleAt, samplePoints } from './reading'

/** 同一视口里最多这么多个部件同时折射，超出的只取样不折射。 */
const MAX_REFRACTING = 3

interface Tracked {
  tone: LiquidTone | null
}

interface Coordinator {
  add: (el: HTMLElement) => void
  remove: (el: HTMLElement) => void
}

const coordinators = new WeakMap<Document, Coordinator>()

/** 部件所在的材质轴：最近一层 data-material 声明为 liquid 才生效。 */
function isLiquid(el: Element): boolean {
  return el.closest('[data-material]')?.getAttribute('data-material') === 'liquid'
}

/** 撤回写过的一切：部件回到皮肤给的静态形态。 */
function release(el: HTMLElement): void {
  el.removeAttribute('data-xh-ink')
  el.removeAttribute('data-xh-liquid-clarity')
  el.style.removeProperty('backdrop-filter')
  el.style.removeProperty('--xh-_liquid-light-x')
  el.style.removeProperty('--xh-_liquid-light-y')
}

function createCoordinator(doc: Document, win: Window, onEmpty: () => void): Coordinator {
  const members = new Set<HTMLElement>()
  const active = new Map<HTMLElement, Tracked>()
  const canRefract = supportsRefraction(win.navigator)
  const canSample = typeof doc.elementsFromPoint === 'function'

  // 任意 CSS 颜色 → 相对亮度：借画布解析，半透明（alpha < 0.5）的底不算数，继续往祖先找
  let context: CanvasRenderingContext2D | null | undefined
  const luminanceOf = (color: string): number | null => {
    if (context === undefined) {
      const canvas = doc.createElement('canvas')
      canvas.width = canvas.height = 1
      context = canvas.getContext('2d', { willReadFrequently: true })
    }
    if (!context)
      return null
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = 'rgb(0 0 0 / 0)'
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    if (a! < 128)
      return null
    return relativeLuminance(r! / 255, g! / 255, b! / 255)
  }

  const exclude = (el: Element): boolean => {
    for (const liquid of active.keys()) {
      if (liquid.contains(el))
        return true
    }
    return false
  }

  const visible = (rect: DOMRect): boolean =>
    rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < win.innerHeight && rect.left < win.innerWidth

  /** 按材质轴重新分组：轴改成 liquid 的部件开始跟踪，改走的撤回。 */
  function sync(): void {
    for (const el of members) {
      if (!el.isConnected)
        continue
      const liquid = isLiquid(el)
      if (liquid && !active.has(el)) {
        active.set(el, { tone: null })
        resizer?.observe(el)
      }
      else if (!liquid && active.has(el)) {
        active.delete(el)
        resizer?.unobserve(el)
        release(el)
      }
    }
  }

  function probe(): void {
    if (!canSample)
      return
    for (const [el, state] of active) {
      const rect = el.getBoundingClientRect()
      if (!visible(rect))
        continue
      const samples = samplePoints(rect).map(([x, y]) => sampleAt(doc, x, y, exclude, luminanceOf))
      const reading = readBackdrop(samples, state.tone)
      if (!reading)
        continue
      state.tone = reading.tone
      // 浅色调是黑墨域，深色调是白墨域：墨色域同时是主题边界，按主题取值的液态通道随之落到那一种色调
      const ink = reading.tone === 'light' ? 'dark' : 'light'
      if (el.getAttribute('data-xh-ink') !== ink)
        el.setAttribute('data-xh-ink', ink)
      if (reading.clear)
        el.setAttribute('data-xh-liquid-clarity', 'clear')
      else
        el.removeAttribute('data-xh-liquid-clarity')
    }
  }

  function refract(): void {
    if (!canRefract)
      return
    let refracting = 0
    for (const el of active.keys()) {
      // 先按静态形态读：行内的折射滤镜会遮住皮肤给的模糊与饱和
      el.style.removeProperty('backdrop-filter')
      const rect = el.getBoundingClientRect()
      const style = win.getComputedStyle(el)
      const backdrop = parseBackdrop(style.backdropFilter)
      const fits = rect.width <= MAX_REFRACT_WIDTH && rect.height <= MAX_REFRACT_HEIGHT
      if (!backdrop || !fits || !visible(rect) || refracting >= MAX_REFRACTING)
        continue
      const radius = Math.min(Number.parseFloat(style.borderTopLeftRadius) || 0, rect.width / 2, rect.height / 2)
      const bezel = Math.min(Number.parseFloat(style.getPropertyValue('--xh-material-liquid-bezel')) || 0, Math.min(rect.width, rect.height) * 0.45)
      if (bezel <= 0)
        continue
      const id = ensureLens(lensLibrary(doc), { width: rect.width, height: rect.height, radius, bezel, ...backdrop })
      if (!id)
        continue
      el.style.setProperty('backdrop-filter', `url(#${id})`)
      refracting++
    }
  }

  let pointer: { x: number, y: number } | null = null

  function light(): void {
    for (const el of active.keys()) {
      const direction = pointer && resolveMotionPreference(el) !== 'reduce'
        ? lightDirection(el.getBoundingClientRect(), pointer.x, pointer.y)
        : null
      if (direction) {
        el.style.setProperty('--xh-_liquid-light-x', String(direction[0]))
        el.style.setProperty('--xh-_liquid-light-y', String(direction[1]))
      }
      else {
        el.style.removeProperty('--xh-_liquid-light-x')
        el.style.removeProperty('--xh-_liquid-light-y')
      }
    }
  }

  // 读写都按帧合并：滚动与指针事件一帧里来几次，只量一次、写一次
  let frame = 0
  const pending = { sync: false, probe: false, refract: false, light: false }
  function schedule(work: Partial<typeof pending>): void {
    for (const [key, on] of Object.entries(work) as Array<[keyof typeof pending, boolean]>) {
      if (on)
        pending[key] = true
    }
    if (frame)
      return
    frame = win.requestAnimationFrame(() => {
      frame = 0
      const run = { ...pending }
      pending.sync = pending.probe = pending.refract = pending.light = false
      if (run.sync)
        sync()
      if (run.sync || run.refract)
        refract()
      if (run.sync || run.probe)
        probe()
      if (run.sync || run.light)
        light()
    })
  }

  const resizer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedule({ refract: true, probe: true })) : null
  // 材质轴可以写在任意祖先上，也可以随时改：盯住文档里所有 data-material 的变化
  const axis = typeof MutationObserver === 'function'
    ? new MutationObserver(() => schedule({ sync: true }))
    : null

  const onScroll = (): void => schedule({ probe: true })
  const onResize = (): void => schedule({ probe: true, refract: true })
  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
      return
    pointer = { x: event.clientX, y: event.clientY }
    schedule({ light: true })
  }
  const onPointerLeave = (): void => {
    pointer = null
    schedule({ light: true })
  }

  function start(): void {
    axis?.observe(doc.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-material'] })
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true })
    win.addEventListener('resize', onResize, { passive: true })
    doc.addEventListener('pointermove', onPointerMove, { passive: true })
    doc.documentElement.addEventListener('pointerleave', onPointerLeave)
  }

  function stop(): void {
    if (frame)
      win.cancelAnimationFrame(frame)
    frame = 0
    axis?.disconnect()
    resizer?.disconnect()
    doc.removeEventListener('scroll', onScroll, { capture: true })
    win.removeEventListener('resize', onResize)
    doc.removeEventListener('pointermove', onPointerMove)
    doc.documentElement.removeEventListener('pointerleave', onPointerLeave)
    doc.querySelector('svg[data-xh-liquid-lenses]')?.remove()
  }

  return {
    add(el) {
      if (members.size === 0)
        start()
      members.add(el)
      schedule({ sync: true })
    },
    remove(el) {
      if (!members.delete(el))
        return
      if (active.delete(el)) {
        resizer?.unobserve(el)
        release(el)
      }
      if (members.size === 0) {
        stop()
        onEmpty()
      }
    },
  }
}

/**
 * 把一个液态部件挂进所在文档的液态面协调器，返回撤出函数。
 * 部件在材质轴为 liquid 时才生效；撤出时写过的属性、行内样式一并撤回。
 */
export function trackLiquidSurface(el: HTMLElement): () => void {
  const doc = el.ownerDocument
  const win = doc.defaultView
  if (!win)
    return () => {}
  let coordinator = coordinators.get(doc)
  if (!coordinator) {
    coordinator = createCoordinator(doc, win, () => coordinators.delete(doc))
    coordinators.set(doc, coordinator)
  }
  const target = coordinator
  target.add(el)
  let done = false
  return () => {
    if (done)
      return
    done = true
    target.remove(el)
  }
}
