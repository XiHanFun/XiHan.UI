/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择类组件的值边界。作者交进来的值可以是任意类型（数字、对象），机器、DOM 的 data-value 与连打检索只认字符串键：
// props 进机器前经这里编成键，onValueChange 出去前解回原值；connect 的 getter 收值时编码、api 交值时解码。
// 每个服务一份，挂在它的 scope 上。值全是字符串时键即值、什么都不记，编解码原样返回，现有写法不多付一点开销。

import type { Scope } from '@xihan-ui/core'

/**
 * 对象值怎样取键：字段名，或取值函数。值是对象时给它——同一个选项每次都是新对象（接口刚取回来）也认得出来；
 * 不给时按对象身份认，同一个对象才是同一个值。值不是对象（字符串、数字）时用不着它。
 */
export type SelectionValueKey<V> = [Extract<V, object>] extends [never]
  ? never
  : (Extract<keyof Extract<V, object>, string>) | ((value: Extract<V, object>) => string)

export interface ValueCodec {
  /** 记过非字符串的值没有。没有时编解码都是原样，api 的解码包装可以整个跳过。 */
  readonly identity: boolean
  /** 值 → 键。字符串原样；数字与布尔转成字符串；对象按 valueKey，没给就按身份发一个。非字符串的值顺手记下，解码时找得回来。 */
  key: (value: unknown) => string
  /** 键 → 值。记过的还原成原值，没记过的就是键本身。 */
  value: (key: string) => unknown
}

interface CodecState extends ValueCodec {
  identity: boolean
  valueKey: SelectionValueKey<unknown> | undefined
}

const codecs = new WeakMap<Scope, CodecState>()

function createCodec(): CodecState {
  // 非字符串的值按键记一份；对象按身份发的键另记，同一个对象每次拿到同一个键
  const values = new Map<string, unknown>()
  const objectKeys = new WeakMap<object, string>()
  let objectCount = 0
  const codec: CodecState = {
    identity: true,
    valueKey: undefined,
    key: (value) => {
      if (typeof value === 'string')
        return value
      let key: string
      if (typeof value === 'object' && value !== null) {
        const valueKey = codec.valueKey as string | ((value: object) => string) | undefined
        if (typeof valueKey === 'function') {
          key = valueKey(value)
        }
        else if (valueKey != null) {
          key = String((value as Record<string, unknown>)[valueKey])
        }
        else {
          key = objectKeys.get(value) ?? `xh-value:${++objectCount}`
          objectKeys.set(value, key)
        }
      }
      else {
        key = String(value)
      }
      values.set(key, value)
      codec.identity = false
      return key
    },
    value: key => (values.has(key) ? values.get(key) : key),
  }
  return codec
}

/**
 * 这个服务的值边界。归一 props 时带上 valueKey 换成这一轮的（React 里内联的取值函数每次渲染都是新的），
 * connect 里只取不改。
 */
export function valueCodecOf(scope: Scope, options?: { valueKey: SelectionValueKey<never> | undefined }): ValueCodec {
  let codec = codecs.get(scope)
  if (!codec) {
    codec = createCodec()
    codecs.set(scope, codec)
  }
  if (options)
    codec.valueKey = options.valueKey as SelectionValueKey<unknown> | undefined
  return codec
}

/** 选中值的入参（裸值、数组、null、undefined）编成键，形状不变：undefined 仍是非受控，null 仍是受控且无选中。 */
export function encodeSelection(codec: ValueCodec, value: unknown): string | string[] | null | undefined {
  if (value === undefined || value === null)
    return value
  return Array.isArray(value) ? value.map(codec.key) : codec.key(value)
}

/** 一组键解回原值。 */
export function decodeValues(codec: ValueCodec, keys: readonly string[]): unknown[] {
  return codec.identity ? [...keys] : keys.map(codec.value)
}

const encodedNodes = new WeakMap<ValueCodec, WeakMap<readonly object[], readonly object[]>>()

/** 编过的条目 → 作者给的那一条。 */
const originals = new WeakMap<object, object>()

/**
 * 条目数据（每条带 value）编成键。按数组身份记一份：collection 没换时拿同一个数组，机器里按身份比的依赖不会每次都变。
 * 值全是字符串时原样返回，不复制。
 */
export function encodeNodes<N extends { value: unknown }>(codec: ValueCodec, nodes: readonly N[] | undefined): (Omit<N, 'value'> & { value: string })[] | undefined {
  if (!nodes || nodes.every(node => typeof node.value === 'string'))
    return nodes as (Omit<N, 'value'> & { value: string })[] | undefined
  let cache = encodedNodes.get(codec)
  if (!cache) {
    cache = new WeakMap()
    encodedNodes.set(codec, cache)
  }
  const hit = cache.get(nodes)
  if (hit)
    return hit as (Omit<N, 'value'> & { value: string })[]
  const encoded = nodes.map((node) => {
    const copy = { ...node, value: codec.key(node.value) }
    originals.set(copy, node)
    return copy
  })
  cache.set(nodes, encoded)
  return encoded
}

/** 交还作者的条目（自定义过滤这类回调要拿原值）；没编过（值本来就是字符串）的就是它本身。 */
export function originalNode<N extends object>(node: N): N {
  return (originals.get(node) as N | undefined) ?? node
}

interface SelectionProps {
  value?: unknown
  defaultValue?: unknown
  collection?: readonly { value: unknown }[]
  onValueChange?: (details: { value: never }) => void
}

/**
 * 选择类机器的 props 边界：value / defaultValue / collection 编成键，onValueChange 收到的键解回原值，
 * 形状照旧（单选是裸值还是数组随组件，这里不动）。onValueChange 一律包一层：手写的条目在 connect 里才编码，
 * 归一 props 这一刻还看不出值是不是全是字符串，解码时再看（全是字符串时原样交出）。
 */
export function encodeSelectionProps<P extends SelectionProps>(props: P, codec: ValueCodec): P {
  const onValueChange = props.onValueChange as ((details: { value: unknown }) => void) | undefined
  const encoded = {
    ...props,
    value: encodeSelection(codec, props.value),
    defaultValue: encodeSelection(codec, props.defaultValue),
    collection: encodeNodes(codec, props.collection),
  }
  if (onValueChange) {
    encoded.onValueChange = ((details: { value: string | string[] | null }) => onValueChange({
      ...details,
      value: Array.isArray(details.value) ? decodeValues(codec, details.value) : details.value == null ? details.value : codec.value(details.value),
    })) as P['onValueChange']
  }
  return encoded
}

/**
 * 一组收 { value } 的 getter（条目、标签那几个）换成先编码再交给原 getter 的版本，按名字列出来批量换。
 * 按名单换而不是逐个写 `getItemProps: …`：门禁按「从 getXxxProps 起」切 connect 源码判投影，切到的得是原 getter。
 */
export function keyedGetters<A extends object>(codec: ValueCodec, api: A, names: readonly (keyof A & string)[]): Partial<A> {
  const out: Partial<A> = {}
  for (const name of names) {
    const get = api[name] as (props: { value: unknown }) => unknown
    out[name] = ((props: { value: unknown }) => get(encodeValueProp(codec, props))) as A[typeof name]
  }
  return out
}

/** 收 { value } 的入参（条目、标签的 getter）编成键再交给原 getter；字符串值原样交过去，不另造对象。 */
export function encodeValueProp<P extends { value: unknown }>(codec: ValueCodec, props: P): Omit<P, 'value'> & { value: string } {
  return typeof props.value === 'string'
    ? props as Omit<P, 'value'> & { value: string }
    : { ...props, value: codec.key(props.value) }
}

const decodedMetas = new WeakMap<ValueCodec, WeakMap<object, readonly object[]>>()

/**
 * 带 value 的元信息（条目、标签）解回原值。全是字符串时原样返回；给了 source（元信息由它推出、它没换元信息就不变）
 * 时按它的身份记一份，一万条的 collection 不必每次 connect 都重新解一遍。
 */
export function decodeMetas<M extends { value: string }>(codec: ValueCodec, metas: readonly M[], source?: object): (Omit<M, 'value'> & { value: unknown })[] {
  // 交出去的数组谁都不改：api 上的元信息按可变数组声明，这里原样转交
  if (codec.identity)
    return metas as unknown as (Omit<M, 'value'> & { value: unknown })[]
  let cache = source ? decodedMetas.get(codec) : undefined
  if (source && !cache) {
    cache = new WeakMap()
    decodedMetas.set(codec, cache)
  }
  const hit = source ? cache!.get(source) : undefined
  if (hit)
    return hit as (Omit<M, 'value'> & { value: unknown })[]
  const decoded = metas.map(meta => ({ ...meta, value: codec.value(meta.value) }))
  if (source)
    cache!.set(source, decoded)
  return decoded
}

/** 适配器里要拿值去比对或发事件时取它的键（条目上报高亮、比对 collection），与 connect 里编出来的是同一个。 */
export function valueKeyOf(scope: Scope, value: unknown): string {
  return valueCodecOf(scope).key(value)
}
