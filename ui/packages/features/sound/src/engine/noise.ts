// 噪声缓冲：白噪直接均匀随机，粉噪用 Paul Kellet 滤波近似。
// 一秒时长循环播放足以覆盖 UI 音效；每个上下文各缓存一份。

const cache = new WeakMap<AudioContext, Partial<Record<'white' | 'pink', AudioBuffer>>>()

function fillWhite(data: Float32Array): void {
  for (let i = 0; i < data.length; i++)
    data[i] = Math.random() * 2 - 1
}

function fillPink(data: Float32Array): void {
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
}

export function getNoiseBuffer(ctx: AudioContext, color: 'white' | 'pink'): AudioBuffer {
  let entry = cache.get(ctx)
  if (!entry) {
    entry = {}
    cache.set(ctx, entry)
  }
  const hit = entry[color]
  if (hit)
    return hit
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  if (color === 'pink')
    fillPink(data)
  else
    fillWhite(data)
  entry[color] = buffer
  return buffer
}
