/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 背景层公共类型。参数规格既是默认值的来源，也是校验与调参界面的元数据，
// 所以效果只声明一次 params，取默认值、钳制越界、生成调参控件三件事都从它推出来。

export interface NumberParamSpec {
  readonly kind: 'number'
  readonly label: string
  readonly min: number
  readonly max: number
  readonly step: number
  readonly default: number
}

export interface ColorParamSpec {
  readonly kind: 'color'
  readonly label: string
  /** #rgb 或 #rrggbb。 */
  readonly default: string
}

export interface BooleanParamSpec {
  readonly kind: 'boolean'
  readonly label: string
  readonly default: boolean
}

export interface EnumParamSpec {
  readonly kind: 'enum'
  readonly label: string
  readonly values: readonly string[]
  readonly default: string
}

export type ParamSpec = NumberParamSpec | ColorParamSpec | BooleanParamSpec | EnumParamSpec

export type ParamSpecMap = Readonly<Record<string, ParamSpec>>

export type ParamValue = number | string | boolean

export type ParamValues = Readonly<Record<string, ParamValue>>

export type UniformValue = number | readonly number[]

export type UniformMap = Readonly<Record<string, UniformValue>>

/** 传给效果 uniforms() 的每帧上下文。 */
export interface EffectContext {
  readonly params: ParamValues
  /** 渲染缓冲宽度（物理像素）。 */
  readonly width: number
  /** 渲染缓冲高度（物理像素）。 */
  readonly height: number
  /** 已流逝时间（秒），暂停时不推进。 */
  readonly time: number
}

export type ParticleBlend = 'add' | 'normal'

/** 粒子画成什么样：soft 是中心亮、向外晕开的软圆点，solid 是边缘利落的实心圆点。 */
export type ParticleSprite = 'soft' | 'solid'

/**
 * 程序化粒子：位置在顶点着色器里由粒子序号派生的种子实时算出，不占顶点缓冲。
 * body 需实现 `void particle(int id, out vec2 pos, out float size, out vec4 color)`，
 * pos 为 0~1 画布坐标，size 为 CSS 像素直径。
 */
export interface ProceduralParticleSpec {
  readonly mode: 'procedural'
  readonly count: number | ((params: ParamValues) => number)
  readonly body: string
  readonly blend?: ParticleBlend
  /** 缺省 soft。 */
  readonly sprite?: ParticleSprite
}

/**
 * 数据驱动粒子：位置来自点云缓冲，两份点云之间可插值。
 * body 需实现 `vec3 displace(vec3 p, float seed, float t)`，返回扰动后的位置。
 *
 * 不给 travel 时，全部粒子按同一个进度在两份点云之间线性插值。
 * 给了 travel，每颗粒子怎么从上一份点云走到下一份就由效果自己定：各走各的时刻与路线，
 * 路上还能淡出淡入。travel 是一段 GLSL，接在 body 之后，需实现
 *
 * `vec3 travel(vec3 from, vec3 to, vec2 presence, float morph, float seed, float t, out float blend, out float alpha)`
 *
 * - presence.x、presence.y 为 1 表示上一份、下一份点云存在，为 0 即这一端是空的（从无到有、从有到无）；
 *   空的那一端，from 与 to 给的是同一个位置
 * - morph 是 0~1 的整体进度，seed 是这颗粒子的 0~1 随机数，t 是秒
 * - 返回这颗粒子此刻的位置；blend 输出它的颜色在两份点云之间取到哪（0~1），alpha 输出它的可见度（0~1）
 *
 * 返回的位置之后照常过一遍 displace。
 * 有 travel 的效果里空点云是合法的一端：对正显示着形状的画面 `setCloud(空点云)`，粒子走完退场才消失；
 * 第一份点云不再从球壳飞来，而是按 travel 从无到有入场。
 */
export interface CloudParticleSpec {
  readonly mode: 'cloud'
  readonly body: string
  readonly travel?: string
  readonly blend?: ParticleBlend
  /** 缺省 soft。 */
  readonly sprite?: ParticleSprite
}

export type ParticleSpec = ProceduralParticleSpec | CloudParticleSpec

export interface BackgroundEffect {
  readonly name: string
  readonly params: ParamSpecMap
  /** 注入两个通道的公共 GLSL：uniform 声明与共享函数。 */
  readonly shared?: string
  /** 流场通道的片元着色器主体，含 main()。 */
  readonly fragment?: string
  readonly particles?: ParticleSpec
  readonly uniforms?: (ctx: EffectContext) => UniformMap
  /** 无 WebGL2 时用作 canvas 的 CSS background。 */
  readonly fallback?: (params: ParamValues) => string
  /** 渲染分辨率倍率。画面本身柔和的效果调低即可省掉大半像素。 */
  readonly scale?: number
}

/**
 * 点云：图片、文字、SVG、参数方程都归一到这一种表示。
 * positions 是 xyz 三元组，约定在 [-1, 1]；colors 是 rgb 三元组，0~1。
 */
export interface PointCloud {
  readonly count: number
  readonly positions: Float32Array
  readonly colors: Float32Array
  /** 每点相对大小，缺省视为全 1。 */
  readonly sizes?: Float32Array
}

/** auto 按设备像素比与硬件并发数推断。 */
export type BackgroundQuality = 'auto' | 'high' | 'balanced' | 'eco'

export type BackgroundBackend = 'webgl2' | 'css'

export interface BackgroundSurfaceOptions {
  readonly effect: BackgroundEffect | string
  readonly params?: Readonly<Record<string, ParamValue>>
  readonly quality?: BackgroundQuality
  /** 自动绑定指针事件到画布。想自己喂坐标就关掉，改调 setPointer()。 */
  readonly pointer?: boolean
  /** 创建后立即播放，默认 true。 */
  readonly autoplay?: boolean
  /** 系统开启减弱动态效果时冻结时间轴，默认 true。 */
  readonly respectReducedMotion?: boolean
  /** 滚出视口时暂停绘制，默认 true。 */
  readonly pauseOffscreen?: boolean
}

export interface MorphOptions {
  /** 形态过渡时长（秒），0 表示立即切换。 */
  readonly duration?: number
}

export interface BackgroundSurface {
  readonly canvas: HTMLCanvasElement
  readonly backend: BackgroundBackend
  readonly effect: BackgroundEffect
  readonly playing: boolean
  setEffect: (effect: BackgroundEffect | string) => void
  setParams: (patch: Readonly<Record<string, ParamValue>>) => void
  getParams: () => ParamValues
  setQuality: (quality: BackgroundQuality) => void
  /** 指针位置，归一化到 0~1，原点在左下角。 */
  setPointer: (x: number, y: number, active?: boolean) => void
  /** 换点云。效果的粒子通道是 cloud 模式时才有意义。 */
  setCloud: (cloud: PointCloud, options?: MorphOptions) => void
  play: () => void
  pause: () => void
  resize: () => void
  destroy: () => void
}
