import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface PopoverOptions {
  /** 是否显示 */
  visible?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示箭头 */
  arrow?: boolean;
  /** 是否可点击外部关闭 */
  clickOutside?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 悬停延迟时间（毫秒） */
  hoverDelay?: number;
  /** 位置 */
  placement?: "top" | "right" | "bottom" | "left";
  /** 触发方式 */
  trigger?: "click" | "hover" | "focus" | "manual";
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 显示回调 */
  onShow?: () => void;
  /** 隐藏回调 */
  onHide?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

export interface PopoverState {
  /** 是否显示 */
  visible: Ref<boolean>;
  /** 显示弹出框 */
  show: () => void;
  /** 隐藏弹出框 */
  hide: () => void;
  /** 切换显示状态 */
  toggle: () => void;
  /** 关闭 */
  close: () => void;
}

/**
 * 使用弹出框
 * @param options - 配置选项
 * @returns 弹出框状态
 */
export function usePopover(options: PopoverOptions = {}): PopoverState {
  const {
    visible = false,
    closable = true,
    arrow = true,
    clickOutside = true,
    hoverable = false,
    hoverDelay = 200,
    placement = "top",
    trigger = "click",
    title = "",
    content = "",
    onShow,
    onHide,
    onClose,
  } = options;

  const isVisible = ref(visible);
  let hoverTimer: number | null = null;

  const show = () => {
    isVisible.value = true;
    onShow?.();
  };

  const hide = () => {
    isVisible.value = false;
    onHide?.();
  };

  const toggle = () => {
    isVisible.value = !isVisible.value;
    if (isVisible.value) {
      onShow?.();
    } else {
      onHide?.();
    }
  };

  const close = () => {
    if (!closable) return;
    onClose?.();
    hide();
  };

  const handleMouseEnter = () => {
    if (!hoverable) return;
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    show();
  };

  const handleMouseLeave = () => {
    if (!hoverable) return;
    hoverTimer = window.setTimeout(() => {
      hide();
    }, hoverDelay);
  };

  onMounted(() => {
    if (visible) {
      show();
    }
  });

  onUnmounted(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    hide();
  });

  return {
    visible: isVisible,
    show,
    hide,
    toggle,
    close,
  };
}
