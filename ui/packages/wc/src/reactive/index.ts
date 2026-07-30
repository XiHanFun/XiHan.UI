// 自研响应式自定义元素基类，替代 @lit/reactive-element。
// 派生自 HTMLElement，Node 下不可 import。

export { XhReactiveElement } from './element'
export type {
  AttributeConverter,
  ComplexAttributeConverter,
  PropertyDeclaration,
  PropertyDeclarations,
  PropertyValues,
  ReactiveController,
  ReactiveControllerHost,
} from './types'
