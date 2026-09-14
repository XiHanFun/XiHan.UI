// Web Audio 测试替身：把节点图与参数调度记录成纯数据，供各判据检查。
// 只实现引擎用到的最小表面；浏览器会抛异常的调用（指数 ramp 到非正值、
// 未 start 就 stop、start 两次）在替身里同样抛，违规当场暴露。

export interface ParamCall {
  method: 'set' | 'setValueAtTime' | 'linearRampToValueAtTime' | 'exponentialRampToValueAtTime' | 'setTargetAtTime' | 'cancelScheduledValues'
  value: number
  time: number
}

export class FakeParam {
  calls: ParamCall[] = []
  private current: number

  constructor(defaultValue: number) {
    this.current = defaultValue
  }

  get value(): number {
    return this.current
  }

  set value(next: number) {
    this.current = next
    this.calls.push({ method: 'set', value: next, time: -1 })
  }

  setValueAtTime(value: number, time: number): void {
    this.calls.push({ method: 'setValueAtTime', value, time })
  }

  linearRampToValueAtTime(value: number, time: number): void {
    this.calls.push({ method: 'linearRampToValueAtTime', value, time })
  }

  exponentialRampToValueAtTime(value: number, time: number): void {
    if (value <= 0)
      throw new RangeError(`exponentialRampToValueAtTime 不接受非正值：${value}`)
    this.calls.push({ method: 'exponentialRampToValueAtTime', value, time })
  }

  setTargetAtTime(value: number, time: number, timeConstant: number): void {
    if (timeConstant <= 0)
      throw new RangeError(`setTargetAtTime 的时间常数必须为正：${timeConstant}`)
    this.calls.push({ method: 'setTargetAtTime', value, time })
  }

  cancelScheduledValues(time: number): void {
    this.calls.push({ method: 'cancelScheduledValues', value: 0, time })
  }
}

export class FakeNode {
  kind: string
  connections: FakeNode[] = []
  disconnected = false

  constructor(kind: string) {
    this.kind = kind
  }

  connect(target: FakeNode): FakeNode {
    this.connections.push(target)
    this.disconnected = false
    return target
  }

  disconnect(): void {
    this.disconnected = true
    this.connections = []
  }

  /** 从本节点出发能否到达 target（沿 connect 边）。 */
  reaches(target: FakeNode, seen = new Set<FakeNode>()): boolean {
    if (this === target)
      return true
    if (seen.has(this))
      return false
    seen.add(this)
    return this.connections.some(next => next.reaches(target, seen))
  }
}

export class FakeGain extends FakeNode {
  gain = new FakeParam(1)

  constructor() {
    super('gain')
  }
}

export class FakeBuffer {
  private channels: Float32Array[]
  length: number
  sampleRate: number

  constructor(channelCount: number, length: number, sampleRate: number) {
    this.length = length
    this.sampleRate = sampleRate
    this.channels = Array.from({ length: channelCount }, () => new Float32Array(length))
  }

  getChannelData(index: number): Float32Array {
    const data = this.channels[index]
    if (!data)
      throw new RangeError(`没有第 ${index} 声道`)
    return data
  }
}

class FakeScheduledSource extends FakeNode {
  started: number | undefined
  stopped: number | undefined
  onended: (() => void) | null = null

  start(time = 0): void {
    if (this.started !== undefined)
      throw new Error('同一个源 start 了两次')
    this.started = time
  }

  stop(time = 0): void {
    if (this.started === undefined)
      throw new Error('未 start 就 stop')
    this.stopped = time
  }
}

export class FakeOscillator extends FakeScheduledSource {
  type = 'sine'
  frequency = new FakeParam(440)
  detune = new FakeParam(0)

  constructor() {
    super('oscillator')
  }
}

export class FakeBufferSource extends FakeScheduledSource {
  buffer: FakeBuffer | null = null
  loop = false

  constructor() {
    super('buffer-source')
  }
}

export class FakeBiquadFilter extends FakeNode {
  type = 'lowpass'
  frequency = new FakeParam(350)
  Q = new FakeParam(1)
  gain = new FakeParam(0)

  constructor() {
    super('biquad-filter')
  }
}

export class FakeCompressor extends FakeNode {
  threshold = new FakeParam(-24)
  knee = new FakeParam(30)
  ratio = new FakeParam(12)
  attack = new FakeParam(0.003)
  release = new FakeParam(0.25)

  constructor() {
    super('compressor')
  }
}

export class FakeConvolver extends FakeNode {
  buffer: FakeBuffer | null = null

  constructor() {
    super('convolver')
  }
}

export class FakeAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'running'
  currentTime = 0
  sampleRate = 48000
  destination = new FakeNode('destination')
  created: FakeNode[] = []
  resumeCalls = 0
  closeCalls = 0
  private listeners = new Set<() => void>()

  private track<T extends FakeNode>(node: T): T {
    this.created.push(node)
    return node
  }

  createGain(): FakeGain {
    return this.track(new FakeGain())
  }

  createOscillator(): FakeOscillator {
    return this.track(new FakeOscillator())
  }

  createBufferSource(): FakeBufferSource {
    return this.track(new FakeBufferSource())
  }

  createBiquadFilter(): FakeBiquadFilter {
    return this.track(new FakeBiquadFilter())
  }

  createDynamicsCompressor(): FakeCompressor {
    return this.track(new FakeCompressor())
  }

  createConvolver(): FakeConvolver {
    return this.track(new FakeConvolver())
  }

  createBuffer(channels: number, length: number, sampleRate: number): FakeBuffer {
    return new FakeBuffer(channels, length, sampleRate)
  }

  resume(): Promise<void> {
    this.resumeCalls++
    return Promise.resolve()
  }

  close(): Promise<void> {
    this.closeCalls++
    this.setState('closed')
    return Promise.resolve()
  }

  addEventListener(type: string, listener: () => void): void {
    if (type === 'statechange')
      this.listeners.add(listener)
  }

  removeEventListener(type: string, listener: () => void): void {
    if (type === 'statechange')
      this.listeners.delete(listener)
  }

  /** 测试手动翻转状态并触发 statechange。 */
  setState(next: 'running' | 'suspended' | 'closed'): void {
    this.state = next
    for (const listener of this.listeners)
      listener()
  }

  /** 全部 FakeParam（带宿主节点类型），供判据扫描。 */
  allParams(): Array<{ node: string, name: string, param: FakeParam }> {
    const out: Array<{ node: string, name: string, param: FakeParam }> = []
    for (const node of this.created) {
      for (const [name, value] of Object.entries(node)) {
        if (value instanceof FakeParam)
          out.push({ node: node.kind, name, param: value })
      }
    }
    return out
  }
}

/** 把 FakeAudioContext 装成全局构造器，返回创建过的实例列表与卸载函数。 */
export function installFakeAudio(initialState: 'running' | 'suspended' = 'running'): { instances: FakeAudioContext[], restore: () => void } {
  const instances: FakeAudioContext[] = []
  const previous = (globalThis as Record<string, unknown>).AudioContext
  class Installed extends FakeAudioContext {
    constructor() {
      super()
      this.state = initialState
      instances.push(this)
    }
  }
  ;(globalThis as Record<string, unknown>).AudioContext = Installed
  return {
    instances,
    restore: () => {
      if (previous === undefined)
        delete (globalThis as Record<string, unknown>).AudioContext
      else
        (globalThis as Record<string, unknown>).AudioContext = previous
    },
  }
}
