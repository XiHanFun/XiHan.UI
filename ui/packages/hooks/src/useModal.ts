import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface ModalOptions {
  /** 是否显示 */
  visible?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示遮罩 */
  mask?: boolean;
  /** 是否可点击遮罩关闭 */
  maskClosable?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否全屏 */
  fullscreen?: boolean;
  /** 是否居中 */
  centered?: boolean;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onOk?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

export interface ModalState {
  /** 是否显示 */
  visible: Ref<boolean>;
  /** 显示模态框 */
  show: () => void;
  /** 隐藏模态框 */
  hide: () => void;
  /** 切换显示状态 */
  toggle: () => void;
  /** 确认 */
  ok: () => void;
  /** 取消 */
  cancel: () => void;
  /** 关闭 */
  close: () => void;
}

/**
 * 使用模态框
 * @param options - 配置选项
 * @returns 模态框状态
 */
export function useModal(options: ModalOptions = {}): ModalState {
  const {
    visible = false,
    closable = true,
    mask = true,
    maskClosable = true,
    draggable = false,
    resizable = false,
    fullscreen = false,
    centered = true,
    width = 520,
    height = "auto",
    title = "",
    content = "",
    okText = "确定",
    cancelText = "取消",
    onOk,
    onCancel,
    onClose,
  } = options;

  const isVisible = ref(visible);

  const show = () => {
    isVisible.value = true;
  };

  const hide = () => {
    isVisible.value = false;
  };

  const toggle = () => {
    isVisible.value = !isVisible.value;
  };

  const ok = () => {
    onOk?.();
    hide();
  };

  const cancel = () => {
    onCancel?.();
    hide();
  };

  const close = () => {
    if (!closable) return;
    onClose?.();
    hide();
  };

  onMounted(() => {
    if (visible) {
      show();
    }
  });

  onUnmounted(() => {
    hide();
  });

  return {
    visible: isVisible,
    show,
    hide,
    toggle,
    ok,
    cancel,
    close,
  };
}
