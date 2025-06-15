import { shallowRef, watch, type Ref, type ShallowRef } from "vue";

export interface DerivedStateOptions<T> {
  /** 是否立即计算 */
  immediate?: boolean;
  /** 初始值 */
  initialValue?: T;
  /** 是否深度监听 */
  deep?: boolean;
}

/**
 * 使用派生状态
 * @param source - 源状态
 * @param compute - 计算函数
 * @param options - 配置选项
 * @returns 派生状态
 */
export function useDerivedState<T, S>(
  source: Ref<S>,
  compute: (value: S) => T,
  options: DerivedStateOptions<T> = {},
): ShallowRef<T> {
  const { immediate = true, initialValue, deep = false } = options;
  const derived = shallowRef<T>(initialValue as T);

  watch(
    source,
    newValue => {
      derived.value = compute(newValue);
    },
    { immediate, deep },
  );

  return derived;
}
