// 发声：把一份钳制过的配方调度成一次真实发声。
// 每层建「源 → 滤波 → 层增益」链，汇入本次发声的总增益，再分干/湿两路送出；
// 全部时间点在启动前一次性排好，最后结束的源负责把整条链拆掉。

import type { EnvelopePoint, SoundSpec } from '../types'
import type { SoundContext } from './context'
import { EPSILON } from '../spec'
import { getNoiseBuffer } from './noise'

/** 一次发声的句柄。stop 立即压掉声音并释放节点。 */
export interface Voice {
  stop: () => void
}

/** 收尾余量（秒）：最后一个包络点之后留给曲线走完的时间。 */
const RELEASE_PAD = 0.06
/** 打断时的淡出时长（秒）。 */
const STOP_FADE = 0.02

/** 与指数段相邻的 0 值换成 EPSILON——指数 ramp 的两端都不许是 0。 */
function effective(point: EnvelopePoint, next: EnvelopePoint | undefined): number {
  if (point.value > 0)
    return point.value
  return (point.curve === 'exp' || next?.curve === 'exp') ? EPSILON : point.value
}

/** 把包络排到参数上：首点定初值并锚定时间轴，后续按曲线逐点 ramp。 */
function scheduleEnvelope(param: AudioParam, points: EnvelopePoint[], base: number): void {
  const first = points[0]
  if (!first)
    return
  const firstValue = effective(first, points[1])
  param.value = firstValue
  param.setValueAtTime(firstValue, base + first.time)
  for (let i = 1; i < points.length; i++) {
    const point = points[i]
    if (!point)
      continue
    const value = effective(point, points[i + 1])
    if (point.curve === 'exp')
      param.exponentialRampToValueAtTime(Math.max(value, EPSILON), base + point.time)
    else
      param.linearRampToValueAtTime(value, base + point.time)
  }
}

export function playSpec(sound: SoundContext, spec: SoundSpec, volume: number): Voice {
  const { ctx, master, reverb } = sound
  const start = ctx.currentTime + 0.003
  const nodes: AudioNode[] = []
  const sources: Array<{ source: OscillatorNode | AudioBufferSourceNode, end: number }> = []

  const voiceGain = ctx.createGain()
  voiceGain.gain.value = (spec.gain ?? 1) * volume
  voiceGain.connect(master)
  nodes.push(voiceGain)

  const space = spec.space ?? 0
  if (space > 0) {
    const send = ctx.createGain()
    send.gain.value = space
    voiceGain.connect(send)
    send.connect(reverb)
    nodes.push(send)
  }

  for (const layer of spec.layers) {
    const base = start + (layer.delay ?? 0)

    let source: OscillatorNode | AudioBufferSourceNode
    if (layer.kind === 'oscillator') {
      const osc = ctx.createOscillator()
      osc.type = layer.wave
      scheduleEnvelope(osc.frequency, layer.frequency, base)
      source = osc
    }
    else {
      const node = ctx.createBufferSource()
      node.buffer = getNoiseBuffer(ctx, layer.color ?? 'white')
      node.loop = true
      source = node
    }
    nodes.push(source)

    let head: AudioNode = source
    if (layer.filter) {
      const filter = ctx.createBiquadFilter()
      filter.type = layer.filter.type
      if (typeof layer.filter.frequency === 'number')
        filter.frequency.value = layer.filter.frequency
      else
        scheduleEnvelope(filter.frequency, layer.filter.frequency, base)
      if (layer.filter.q !== undefined)
        filter.Q.value = layer.filter.q
      if (layer.filter.gain !== undefined)
        filter.gain.value = layer.filter.gain
      head.connect(filter)
      head = filter
      nodes.push(filter)
    }

    const layerGain = ctx.createGain()
    scheduleEnvelope(layerGain.gain, layer.gain, base)
    head.connect(layerGain)
    layerGain.connect(voiceGain)
    nodes.push(layerGain)

    const last = layer.gain[layer.gain.length - 1]
    const tail = base + (last ? last.time : 0)
    const end = tail + RELEASE_PAD
    // 包络没有收到无声就自己收：源在非零增益上被切断会响一声咔哒
    if (last && last.value > EPSILON)
      layerGain.gain.linearRampToValueAtTime(0, end)
    source.start(base)
    source.stop(end)
    sources.push({ source, end })
  }

  // 最后结束的源负责拆链；零层配方没有源，当场拆
  let janitor: OscillatorNode | AudioBufferSourceNode | undefined
  let janitorEnd = -1
  for (const { source, end } of sources) {
    if (end > janitorEnd) {
      janitor = source
      janitorEnd = end
    }
  }
  const teardown = (): void => {
    for (const node of nodes)
      node.disconnect()
  }
  if (janitor)
    janitor.onended = teardown
  else
    teardown()

  let stopped = false
  return {
    stop: () => {
      if (stopped)
        return
      stopped = true
      if (!janitor) {
        teardown()
        return
      }
      // 打断也要有个坡：直接把增益推到 0 再切断同样是咔哒
      const now = ctx.currentTime
      const cut = now + STOP_FADE
      voiceGain.gain.cancelScheduledValues(now)
      voiceGain.gain.setTargetAtTime(0, now, STOP_FADE / 3)
      for (const { source } of sources) {
        // 已排定结束时间的源允许再次 stop，以最后一次为准
        source.stop(cut)
      }
      // 拆链仍由 onended 触发，此刻断开会把这段淡出也切掉
    },
  }
}
