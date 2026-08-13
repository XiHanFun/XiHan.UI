// 音频上下文管理：惰性创建、主链（音量 → 压限器 → 扬声器）与共享混响。
// 上下文等到第一次真正发声才创建——多数页面从头到尾不出声，不为它们付任何代价。

export interface SoundContext {
  ctx: AudioContext
  /** 音量节点，所有发声（含混响湿声）都从它出去。 */
  master: GainNode
  /** 共享混响，各次发声按 space 送入。 */
  reverb: ConvolverNode
}

/** 当前环境能否发声：有无 AudioContext 构造器（SSR 与老浏览器都没有）。 */
export function isAudioSupported(): boolean {
  return typeof globalThis.AudioContext === 'function'
}

/** 指数衰减的立体声噪声脉冲响应，充当小房间混响。 */
function createImpulse(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 0.9)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3.5
  }
  return buffer
}

export function createSoundContext(volume: number): SoundContext {
  const ctx = new AudioContext({ latencyHint: 'interactive' })
  const master = ctx.createGain()
  master.gain.value = volume
  // 压限器兜住多声叠加的峰值，同时到来的提示音不会互相顶出削波
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 12
  compressor.ratio.value = 4
  compressor.attack.value = 0.002
  compressor.release.value = 0.15
  master.connect(compressor)
  compressor.connect(ctx.destination)
  const reverb = ctx.createConvolver()
  reverb.buffer = createImpulse(ctx)
  reverb.connect(master)
  return { ctx, master, reverb }
}
