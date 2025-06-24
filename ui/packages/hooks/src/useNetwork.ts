import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface NetworkState {
  /** 是否在线 */
  isOnline: Ref<boolean>;
  /** 网络类型 */
  type: Ref<string>;
  /** 是否支持网络信息 */
  supported: boolean;
  /** 更新网络状态 */
  update: () => void;
}

/**
 * 使用网络状态
 * @returns 网络状态
 */
export function useNetwork(): NetworkState {
  const isOnline = ref(navigator.onLine);
  const type = ref("unknown");
  const supported = "connection" in navigator;

  const update = () => {
    isOnline.value = navigator.onLine;
    if (supported) {
      const connection = (navigator as any).connection;
      type.value = connection ? connection.effectiveType : "unknown";
    }
  };

  onMounted(() => {
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (supported) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", update);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
    if (supported) {
      const connection = (navigator as any).connection;
      connection.removeEventListener("change", update);
    }
  });

  return {
    isOnline,
    type,
    supported,
    update,
  };
}
