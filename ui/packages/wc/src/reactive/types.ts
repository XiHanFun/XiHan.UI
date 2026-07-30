// 自研响应式自定义元素的公开类型：属性声明、更新载荷、控制器协议。

/** 属性字符串 → 字段值。本运行时不做属性回写，故没有 toAttribute。 */
export interface ComplexAttributeConverter<Type = unknown> {
  fromAttribute?: (value: string | null, type?: unknown) => Type
}

/** 转换器可写成对象，也可直接写成 fromAttribute 函数。 */
export type AttributeConverter<Type = unknown>
  = | ComplexAttributeConverter<Type>
    | ((value: string | null, type?: unknown) => Type)

export interface PropertyDeclaration<Type = unknown> {
  /** false=不观察属性；字符串=指定属性名；缺省=字段名转小写（不转短横线）。 */
  readonly attribute?: boolean | string
  /** 没配 converter 时据此选内建转换：Boolean / Number / Object / Array，其余原样取字符串。 */
  readonly type?: unknown
  /** 自定义转换器，配了就盖过 type。 */
  readonly converter?: AttributeConverter<Type>
  /** 未实现：判等固定 Object.is。写了编译期报错，运行期也抛。 */
  readonly hasChanged?: never
  /** 未实现：本运行时不回写属性。写了编译期报错，运行期也抛。 */
  readonly reflect?: never
  /** 未实现：每条声明必装访问器。写了编译期报错，运行期也抛。 */
  readonly noAccessor?: never
  /** 未实现：没有内部状态这一档声明。写了编译期报错，运行期也抛。 */
  readonly state?: never
}

/** `static properties` 的形状：字段名 → 声明。只支持字符串键，symbol 键在定稿时抛。 */
export interface PropertyDeclarations {
  readonly [name: string]: PropertyDeclaration
}

/** 一轮更新里变过的字段 → 变更前的值。 */
export type PropertyValues = Map<PropertyKey, unknown>

/** 挂在元素上的一段外部逻辑，跟着宿主的连接与更新走。 */
export interface ReactiveController {
  hostConnected?: () => void
  hostUpdate?: () => void
  hostUpdated?: () => void
  hostDisconnected?: () => void
}

/** 控制器眼中的宿主。 */
export interface ReactiveControllerHost {
  addController: (controller: ReactiveController) => void
  removeController: (controller: ReactiveController) => void
  requestUpdate: () => void
  readonly updateComplete: Promise<boolean>
}
