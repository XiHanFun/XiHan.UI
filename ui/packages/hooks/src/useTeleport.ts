import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface TeleportOptions {
  /** 目标选择器 */
  to?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否保留原始位置 */
  preserveContent?: boolean;
}

export interface TeleportState {
  /** 目标元素 */
  target: Ref<Element | null>;
  /** 是否已传送 */
  isTeleported: Ref<boolean>;
  /** 启用传送 */
  enable: () => void;
  /** 禁用传送 */
  disable: () => void;
  /** 切换传送状态 */
  toggle: () => void;
}

/**
 * 使用传送门
 * @param options - 配置选项
 * @returns 传送门状态
 */
export function useTeleport(options: TeleportOptions = {}): TeleportState {
  const { to = "body", disabled = false, preserveContent = false } = options;
  const target = ref<Element | null>(null);
  const isTeleported = ref(!disabled);

  const enable = () => {
    isTeleported.value = true;
  };

  const disable = () => {
    isTeleported.value = false;
  };

  const toggle = () => {
    isTeleported.value = !isTeleported.value;
  };

  onMounted(() => {
    const targetElement = document.querySelector(to);
    if (targetElement) {
      target.value = targetElement;
    } else {
      console.warn(`Target element "${to}" not found`);
    }
  });

  onUnmounted(() => {
    target.value = null;
  });

  return {
    target,
    isTeleported,
    enable,
    disable,
    toggle,
  };
}
