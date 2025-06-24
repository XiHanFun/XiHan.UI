import { reactive, provide, inject } from "vue";
import type { UnwrapRef, InjectionKey } from "vue";

export interface ContextStateOptions {
  /** 注入键名 */
  key?: string;
}

export interface ContextState<T extends object> {
  /** 状态 */
  state: UnwrapRef<T>;
  /** 设置状态 */
  setState: (newState: Partial<T>) => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 使用上下文状态
 * @param initialState - 初始状态
 * @param options - 配置选项
 * @returns 上下文状态提供者和消费者钩子
 */
export function useContextState<T extends object>(initialState: T, options: ContextStateOptions = {}) {
  const { key = "contextState" } = options;

  // 创建注入键
  const stateKey = Symbol(key) as InjectionKey<object>;
  const actionsKey = Symbol(`${key}Actions`) as InjectionKey<{
    setState: (newState: Partial<T>) => void;
    resetState: () => void;
  }>;

  // 提供者钩子
  const provideState = () => {
    const state = reactive({ ...initialState }) as UnwrapRef<T>;

    const setState = (newState: Partial<T>) => {
      Object.assign(state as object, newState);
    };

    const resetState = () => {
      Object.assign(state as object, initialState);
    };

    // 提供状态和操作
    provide(stateKey, state as object);
    provide(actionsKey, { setState, resetState });

    return {
      state,
      setState,
      resetState,
    };
  };

  // 消费者钩子
  const useState = () => {
    const state = inject(stateKey);
    const actions = inject(actionsKey);

    if (!state || !actions) {
      throw new Error("Context state not provided. Make sure to call provideState in a parent component.");
    }

    return {
      state,
      ...actions,
    };
  };

  return {
    provideState,
    useState,
  };
}
