import { onMounted } from "vue";

/**
 * 客户端专用钩子
 * @param fn - 仅在客户端执行的函数
 */
export function useClientOnly(fn: () => void) {
  if (typeof window !== "undefined") {
    onMounted(fn);
  }
}
