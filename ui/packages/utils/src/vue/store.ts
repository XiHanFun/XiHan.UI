/**
 * 状态管理辅助函数
 * 提供Pinia/Vuex状态管理增强和工具
 */

import { computed, reactive, ref, readonly, provide, inject, watch } from "vue";
import type { Ref, ComputedRef, UnwrapRef, InjectionKey } from "vue";
import { defineStore, storeToRefs } from "pinia";
import type { Store, PiniaPluginContext, StateTree, _GettersTree } from "pinia";

/**
 * 创建本地状态存储
 * @param key 存储键名
 * @param initialState 初始状态
 * @returns 本地状态及方法
 */
export function createLocalState<T extends object>(key: string, initialState: T) {
  // 创建响应式状态
  const state = reactive({ ...initialState }) as UnwrapRef<T>;

  // 从本地存储加载状态
  try {
    const storedState = localStorage.getItem(key);
    if (storedState) {
      Object.assign(state as object, JSON.parse(storedState));
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }

  // 状态变化时保存到本地存储
  watch(
    () => state,
    newState => {
      try {
        localStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save state to localStorage:", error);
      }
    },
    { deep: true },
  );

  // 重置状态方法
  const resetState = () => {
    Object.assign(state as object, initialState);
  };

  // 清除状态方法
  const clearState = () => {
    localStorage.removeItem(key);
    resetState();
  };

  return {
    state,
    resetState,
    clearState,
  };
}

/**
 * 创建会话状态存储
 * @param key 存储键名
 * @param initialState 初始状态
 * @returns 会话状态及方法
 */
export function createSessionState<T extends object>(key: string, initialState: T) {
  // 创建响应式状态
  const state = reactive({ ...initialState }) as UnwrapRef<T>;

  // 从会话存储加载状态
  try {
    const storedState = sessionStorage.getItem(key);
    if (storedState) {
      Object.assign(state as object, JSON.parse(storedState));
    }
  } catch (error) {
    console.error("Failed to load state from sessionStorage:", error);
  }

  // 状态变化时保存到会话存储
  watch(
    () => state,
    newState => {
      try {
        sessionStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save state to sessionStorage:", error);
      }
    },
    { deep: true },
  );

  // 重置状态方法
  const resetState = () => {
    Object.assign(state as object, initialState);
  };

  // 清除状态方法
  const clearState = () => {
    sessionStorage.removeItem(key);
    resetState();
  };

  return {
    state,
    resetState,
    clearState,
  };
}

/**
 * 创建上下文状态
 * @param initialState 初始状态
 * @returns 上下文状态提供者和消费者钩子
 */
export function createContextState<T extends object>(initialState: T) {
  // 创建注入键
  const stateKey = Symbol("contextState") as InjectionKey<object>;
  const actionsKey = Symbol("contextActions") as InjectionKey<{
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

/**
 * Pinia持久化插件
 * @param options 插件选项
 * @returns Pinia插件
 */
export function piniaPersistedState(options: {
  key?: string;
  storage?: Storage;
  paths?: string[];
  overwrite?: boolean;
}) {
  const { key = "pinia", storage = localStorage, paths = [], overwrite = false } = options;

  return (context: PiniaPluginContext) => {
    const { store } = context;
    const storeKey = `${key}-${store.$id}`;

    // 恢复状态
    try {
      const fromStorage = storage.getItem(storeKey);
      if (fromStorage) {
        const savedState = JSON.parse(fromStorage);

        if (overwrite) {
          store.$patch(savedState);
        } else {
          store.$patch(state => {
            for (const key of Object.keys(savedState)) {
              if (paths.length === 0 || paths.includes(key)) {
                state[key] = savedState[key];
              }
            }
          });
        }
      }
    } catch (err) {
      console.error("Error loading persisted state:", err);
    }

    // 保存状态变更
    store.$subscribe((_, state) => {
      try {
        const toStore = paths.length
          ? paths.reduce(
              (partialState, path) => {
                partialState[path] = state[path];
                return partialState;
              },
              {} as Record<string, any>,
            )
          : state;

        storage.setItem(storeKey, JSON.stringify(toStore));
      } catch (err) {
        console.error("Error saving persisted state:", err);
      }
    });
  };
}

/**
 * 创建共享的状态容器
 * @param id 存储ID
 * @param initialState 初始状态
 * @param getters 计算属性
 * @param actions 操作方法
 * @returns Pinia store定义
 */
export function defineSharedStore<
  Id extends string,
  State extends StateTree,
  Getters extends _GettersTree<State>,
  Actions,
>(id: Id, initialState: State | (() => State), getters: Getters = {} as Getters, actions: Actions = {} as Actions) {
  return defineStore(id, {
    state: typeof initialState === "function" ? initialState : () => ({ ...initialState }),
    getters,
    actions: actions as any,
  });
}

/**
 * 创建自动StoreToRefs工具
 * @param store Pinia store实例
 * @returns Store属性的Refs引用
 */
export function useStoreRefs<T extends Store>(store: T) {
  return storeToRefs(store);
}

/**
 * 创建派生状态
 * @param source 源状态
 * @param transform 转换函数
 * @returns 计算的派生状态
 */
export function useDerivedState<T, R>(
  source: Ref<T> | ComputedRef<T> | (() => T),
  transform: (value: T) => R,
): ComputedRef<R> {
  const getter = typeof source === "function" ? source : () => source.value;

  return computed(() => transform(getter()));
}

export default {
  createLocalState,
  createSessionState,
  createContextState,
  piniaPersistedState,
  defineSharedStore,
  useStoreRefs,
  useDerivedState,
};
