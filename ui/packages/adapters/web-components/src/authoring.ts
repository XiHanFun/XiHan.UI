/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/web-components/authoring —— 第三方编写 light DOM 自定义元素用：
// 响应式元素基类、布尔属性的三态转换器、生成节点（建节点、写属性与文本）与按 key 复用、事件派发、元素注册、配置与文案控制器，
// 以及自定义元素自己当配置作用域时用的接口与变更通知。不含库内的元素类，Node 下可安全 import。

export { notifyXhConfigChange } from './config'
export type { XhConfig, XhConfigScope } from './config'
export { BOOLEAN_CONVERTER } from './dom/converters'
export { emitEvent } from './dom/emit-event'
export type { EmitEventOptions } from './dom/emit-event'
export { createAuthoredElement, createGeneratedElement, GEN_ATTR, generatedChildren, reconcile, setAttributes, setText, SVG_NS } from './dom/generated-nodes'
export type { ElementAttributes, KeyedChildren } from './dom/generated-nodes'
export { XhReactiveElement } from './reactive'
export type {
  AttributeConverter,
  ComplexAttributeConverter,
  PropertyDeclaration,
  PropertyDeclarations,
  PropertyValues,
  ReactiveController,
  ReactiveControllerHost,
} from './reactive'
export { XhConfigController } from './runtime/config-controller'
export type { XhConfigControllerHost } from './runtime/config-controller'
export { registerElement } from './runtime/register-element'
