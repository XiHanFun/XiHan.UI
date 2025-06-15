import { defineStore, storeToRefs } from "pinia";
import type { Store, PiniaPluginContext, StateTree, _GettersTree } from "pinia";

export interface PiniaPersistedStateOptions {
  /** 存储键名前缀 */
  key?: string;
  /** 存储类型 */
  storage?: Storage;
  /** 需要持久化的路径 */
  paths?: string[];
  /** 是否覆盖现有状态 */
  overwrite?: boolean;
}

/**
 * Pinia持久化插件
 * @param options - 插件选项
 * @returns Pinia插件
 */
export function usePiniaPersistedState(options: PiniaPersistedStateOptions = {}) {
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
 * @param id - 存储ID
 * @param initialState - 初始状态
 * @param getters - 计算属性
 * @param actions - 操作方法
 * @returns Pinia store定义
 */
export function useSharedStore<
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
 * @param store - Pinia store实例
 * @returns Store属性的Refs引用
 */
export function useStoreRefs<T extends Store>(store: T) {
  return storeToRefs(store);
}
