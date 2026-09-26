// 直角坐标图用例的夹具：vanilla 运行时起一台机器，伪造视口尺寸，按场景取标记。
import type { Service } from '@xihan-ui/core'
import type { Mark } from '@xihan-ui/viz'
import type { CartesianChartApi, CartesianChartSchema } from '../src/cartesian-chart'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach } from 'vitest'
import { cartesianChartMachine, connectCartesianChart } from '../src/cartesian-chart'

export type Dict = Record<string, any>
export type Props = Partial<CartesianChartSchema['props']>

export async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []

/** 用例结束时要撤掉的订阅（诊断监听等）。 */
export function onCleanup(stop: () => void): void {
  stops.push(stop)
}

afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

export interface Rig {
  service: Service<CartesianChartSchema>
  api: () => CartesianChartApi
  setProps: (next: Props) => void
}

export async function makeRig(initial: Props, size = { width: 400, height: 240 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  // 几何用例看终态；过渡另有用例，显式打开 animated
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(cartesianChartMachine, { props: () => props.get(), runtime })
  const root = document.createElement('figure')
  const viewport = document.createElement('div')
  root.append(viewport)
  document.body.append(root)
  // 无布局环境量不到尺寸，原地伪造视口的内容盒
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: size.width })
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: size.height })
  service.refs.set('getRootEl', () => root)
  service.refs.set('getViewportEl', () => viewport)
  runtime.start()
  stops.push(() => runtime.stop())
  await settle()
  return {
    service,
    api: () => connectCartesianChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

export function walk(marks: readonly Mark[], out: Mark[] = []): Mark[] {
  for (const mark of marks) {
    out.push(mark)
    if (mark.kind === 'group')
      walk(mark.children, out)
  }
  return out
}

/** 场景三层里某个部件的全部标记，按绘制次序。 */
export function marksOf(api: CartesianChartApi, part: string): Mark[] {
  return walk([...api.scene.layers.back, ...api.scene.layers.data, ...api.scene.layers.front]).filter(m => m.part === part)
}
