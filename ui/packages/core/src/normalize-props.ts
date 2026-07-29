// props-getter 归一化协议：把框架无关的 prop 字典映射为目标框架的 props。
import type { Dict } from './types'

/** 各类元素的 prop 类型占位（适配器泛型特化）。 */
export interface PropTypes<T = Dict> {
  element: T
  button: T
  input: T
  label: T
  output: T
  select: T
  textarea: T
  img: T
  style: Dict
}

/** 归一化器：把原始 prop 字典转换为目标框架 props，每种元素类型一个 getter。 */
export type NormalizeProps<T extends PropTypes = PropTypes> = {
  [K in keyof Omit<T, 'style'>]: (props: Dict) => T[K]
}

/** 由单个转换函数构造一个对所有元素类型一致的归一化器。 */
export function createNormalizer<T extends PropTypes>(transform: (props: Dict) => Dict): NormalizeProps<T> {
  const cache = new Map<string, (props: Dict) => unknown>()
  return new Proxy({} as NormalizeProps<T>, {
    get(_target, key: string) {
      let fn = cache.get(key)
      if (!fn) {
        fn = (props: Dict) => transform(props)
        cache.set(key, fn)
      }
      return fn
    },
  })
}

/** 恒等归一化器：原样返回 prop 字典。 */
export const normalizeProps: NormalizeProps = createNormalizer(props => props)
