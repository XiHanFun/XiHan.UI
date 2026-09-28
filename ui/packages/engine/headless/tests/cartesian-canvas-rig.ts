// 画上画布的夹具：记录调用的 2D 上下文、只记操作的 Path2D，以及把系列分组与探针按连接层的属性放进根。
import type { Mark } from '@xihan-ui/viz'
import type { Dict, Rig } from './cartesian-rig'

export interface Call { name: string, args: unknown[], fillStyle?: unknown, strokeStyle?: unknown, globalAlpha?: number }

export function recordingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D & { calls: Call[] } {
  const calls: Call[] = []
  const state: Record<string, unknown> = { fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1 }
  const ctx = new Proxy({ calls, canvas } as Record<string | symbol, unknown>, {
    get(target, key) {
      if (key in target)
        return target[key]
      if (typeof key === 'string' && key in state)
        return state[key]
      return (...args: unknown[]) => {
        calls.push({ name: String(key), args, fillStyle: state.fillStyle, strokeStyle: state.strokeStyle, globalAlpha: state.globalAlpha as number })
      }
    },
    set(_, key, value) {
      // 画布不认的颜色写法赋不上去：这里的桩什么都认
      state[key as string] = value
      return true
    },
  })
  return ctx as unknown as CanvasRenderingContext2D & { calls: Call[] }
}

export class FakePath2D {
  readonly ops: string[] = []
  moveTo(): void { this.ops.push('M') }
  lineTo(): void { this.ops.push('L') }
  bezierCurveTo(): void { this.ops.push('C') }
  quadraticCurveTo(): void { this.ops.push('Q') }
  arc(): void { this.ops.push('A') }
  arcTo(): void { this.ops.push('T') }
  rect(): void { this.ops.push('R') }
  closePath(): void { this.ops.push('Z') }
  addPath(): void { this.ops.push('P') }
}

function element(tag: string, props: Dict): Element {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'string')
      el.setAttribute(k, v)
  }
  return el
}

/** 把系列分组与探针按连接层的属性放进根：画布从 DOM 读样式。 */
export function mountProbes(rig: Rig): void {
  const root = rig.service.refs.get('getRootEl')() as HTMLElement
  const api = rig.api()
  for (const group of api.layers.plot) {
    if (group.kind !== 'group' || group.part !== 'series')
      continue
    const g = element('g', api.getMarkProps(group) as Dict)
    for (const probe of (group as Mark & { children: readonly Mark[] }).children)
      g.append(element('path', api.getMarkProps(probe) as Dict))
    root.append(g)
  }
}
