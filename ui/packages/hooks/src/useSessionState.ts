import { reactive, watch } from "vue";
import type { UnwrapRef } from "vue";

export interface SessionStateOptions {
  /** 存储键名 */
  key: string;
  /** 是否深度监听 */
  deep?: boolean;
}

/**
 * 使用会话状态存储
 * @param initialState - 初始状态
 * @param options - 配置选项
 * @returns 会话状态及方法
 */
export function useSessionState<T extends object>(initialState: T, options: SessionStateOptions) {
  const { key, deep = true } = options;

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
    { deep },
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
