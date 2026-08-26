import type { ScrollbarSchema } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ReactiveControllerHost } from '../reactive'
import { connectScrollbar, isOverflowing, SCROLLBAR_DEFAULT_TYPE, scrollbarMachine } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { createSpreader } from '../dom/spread'
import { MachineController } from './machine-controller'

// 给已有滚动层配一套自绘滚动条，与 Vue 侧的 useScrollbars 同形。
//
// 节点由本件建、挂在组件既有的壳上（浮层族是 positioner，其余是 root），作者一个字不用写。
// 建出来的节点一律不打 data-xh-part：打了会被宿主的 discoverParts 收进 partMap，
// 于是野节点告警、宿主重接线环、契约 delegates 三样一起找上门。

/** 交给条子的 props。轴由 axes 决定、让位按实测溢出算，两者都不从外面收。 */
export type ScrollbarsProps = Omit<ScrollbarSchema['props'], 'orientation' | 'gutter'>

export interface ScrollbarsControllerOptions {
  /** 真正在滚的那层；多档互斥的宿主在这里交此刻活着的那个。 */
  scrollable: () => HTMLElement | null
  /** 条子挂进去的壳：滚动层的父、组件的定位盒，本身不滚。 */
  shell: () => HTMLElement | null
  /** 摆哪几条轴，默认只摆竖的。 */
  axes?: readonly Orientation[]
  /** 露面时机、尺寸档、方向这些，逐帧现读。 */
  props?: () => ScrollbarsProps
}

interface BarNodes {
  root: HTMLElement
  track: HTMLElement
  thumb: HTMLElement
  /** 交叉口补丁，只在双轴的竖条里有。 */
  corner: HTMLElement | null
}

const DEFAULT_AXES: readonly Orientation[] = ['vertical']

export class ScrollbarsController {
  private readonly axes: readonly Orientation[]
  private readonly ctrls = new Map<Orientation, MachineController<ScrollbarSchema>>()
  private readonly nodes = new Map<Orientation, BarNodes>()
  private readonly spreader = createSpreader()
  /** 几条轴共用一个 scope：id 由它派生，同一套条子归在一起。 */
  private readonly scope = createScope(null, createCounterIdGenerator())
  /** 此刻这套节点挂在哪个壳上；壳换了就整套重建。 */
  private mountedShell: HTMLElement | null = null

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly options: ScrollbarsControllerOptions,
  ) {
    this.axes = options.axes ?? DEFAULT_AXES
  }

  /** 宿主在自己的 wire() 末尾调一次：建节点、建机器、把 connect 产出打上去。 */
  wire(): void {
    if (!this.ensureNodes())
      return
    this.ensureMachines()
    const both = this.both()
    for (const axis of this.axes) {
      const service = this.serviceOf(axis)
      const nodes = this.nodes.get(axis)
      if (!service || !nodes)
        continue
      const api = connectScrollbar(service, wcNormalize)
      this.spreader.spread(nodes.root, api.getRootProps() as Record<string, unknown>)
      this.spreader.spread(nodes.track, api.getTrackProps() as Record<string, unknown>)
      this.spreader.spread(nodes.thumb, api.getThumbProps() as Record<string, unknown>)
      // 只有一条轴在场时右下角没有缺口要补，收起来免得平白盖住一块内容
      if (nodes.corner) {
        this.spreader.spread(nodes.corner, {
          ...api.getCornerProps() as Record<string, unknown>,
          hidden: both ? undefined : true,
        })
      }
    }
  }

  /**
   * 节点就位之后才建机器。
   * 机器一跑起来就去解析滚动容器，解析到就给它打 data-xh-scrollbar（皮肤据此把原生条藏成零宽），
   * 解析不到则投一条 scrollbar.missing-scrollable。
   * 壳不在场时一条自绘条都没建出来，这两件事都不该发生。
   */
  private ensureMachines(): void {
    if (this.ctrls.size)
      return
    for (const axis of this.axes) {
      this.ctrls.set(axis, new MachineController<ScrollbarSchema>(
        this.host,
        scrollbarMachine,
        () => this.machineProps(axis),
        { scope: this.scope, onBuilt: svc => this.injectRefs(svc, axis) },
      ))
    }
  }

  /** 机器建起来之前 service 还不存在，取用处一律先问一句。 */
  private serviceOf(axis: Orientation): Service<ScrollbarSchema> | null {
    return (this.ctrls.get(axis)?.service as Service<ScrollbarSchema> | undefined) ?? null
  }

  private machineProps(axis: Orientation): Partial<ScrollbarSchema['props']> {
    return {
      ...this.options.props?.(),
      orientation: axis,
      gutter: this.both(),
    }
  }

  /**
   * 两条轴都在场：各自在末端让出交叉口那一格，只有一条时不让，免得滑块行程平白短一截。
   * 判据不走 connect：那里就要读 gutter，读回来会绕成环，所以直接读作者给的 props 与量到的尺寸。
   */
  private both(): boolean {
    if (this.axes.length < 2)
      return false
    const given = this.options.props?.()
    const type = given?.type ?? SCROLLBAR_DEFAULT_TYPE
    for (const axis of this.axes) {
      const service = this.serviceOf(axis)
      if (!service)
        return false
      const native = service.context.get('coarse') && !given?.forceVisible
      if (native || !(type === 'always' || isOverflowing(service.context.get('metrics'))))
        return false
    }
    return true
  }

  private injectRefs(service: Service<ScrollbarSchema>, axis: Orientation): void {
    // 传 getter 而非节点：节点在 wire() 里才建出来，量尺寸与挂监听都在机器的效应里进行
    service.refs.set('getScrollableEl', this.options.scrollable)
    service.refs.set('getTrackEl', () => this.nodes.get(axis)?.track ?? null)
    service.refs.set('getRootEl', () => this.nodes.get(axis)?.root ?? null)
  }

  /** 按当前壳建一套条子；壳没到就早退，壳换了就把旧那套摘掉重建。 */
  private ensureNodes(): boolean {
    const shell = this.options.shell()
    if (!shell)
      return false
    if (this.mountedShell === shell)
      return true

    for (const nodes of this.nodes.values()) {
      this.spreader.release(nodes.root)
      this.spreader.release(nodes.track)
      this.spreader.release(nodes.thumb)
      if (nodes.corner)
        this.spreader.release(nodes.corner)
      nodes.root.remove()
    }
    this.nodes.clear()

    const doc = this.host.ownerDocument
    for (const axis of this.axes) {
      const root = doc.createElement('div')
      const track = doc.createElement('div')
      const thumb = doc.createElement('div')
      track.append(thumb)
      root.append(track)
      const corner = this.axes.length > 1 && axis === 'vertical' ? doc.createElement('div') : null
      if (corner)
        root.append(corner)
      shell.append(root)
      this.nodes.set(axis, { root, track, thumb, corner })
    }
    this.mountedShell = shell
    // 本轮的追踪器已经跑过，新节点它看不见：再催一轮，下一轮才把监听与量尺寸挪到这套节点上
    this.host.requestUpdate()
    return true
  }
}
