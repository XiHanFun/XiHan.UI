/**
 * Teleport 辅助函数模块
 * 提供跨组件传送、模态框和弹出层管理工具
 */

import { ref, onMounted, onBeforeUnmount, nextTick, h, defineComponent } from "vue";
import type { Ref, Component, VNode } from "vue";

/**
 * Teleport目标管理器
 * 用于动态创建和移除Teleport目标
 */
export const TeleportTargetManager = {
  /**
   * 创建Teleport目标元素
   * @param id 目标ID
   * @param tag HTML标签名
   * @param attributes HTML属性
   * @returns 创建的DOM元素
   */
  createTarget(id: string, tag: string = "div", attributes: Record<string, string> = {}): HTMLElement {
    // 检查是否已存在
    const existingTarget = document.getElementById(id);
    if (existingTarget) {
      return existingTarget;
    }

    // 创建新元素
    const target = document.createElement(tag);
    target.id = id;

    // 应用属性
    Object.entries(attributes).forEach(([key, value]) => {
      target.setAttribute(key, value);
    });

    // 添加到body
    document.body.appendChild(target);
    return target;
  },

  /**
   * 移除Teleport目标元素
   * @param id 目标ID
   */
  removeTarget(id: string): void {
    const target = document.getElementById(id);
    if (target && target.parentNode) {
      target.parentNode.removeChild(target);
    }
  },
};

/**
 * 使用动态Teleport目标
 * @param id 目标ID
 * @param attributes 目标元素属性
 * @returns Teleport目标信息
 */
export function useTeleportTarget(id: string, attributes: Record<string, string> = {}) {
  const target: Ref<HTMLElement | null> = ref(null);

  onMounted(() => {
    // 在客户端创建目标元素
    target.value = TeleportTargetManager.createTarget(id, "div", attributes);
  });

  onBeforeUnmount(() => {
    // 组件卸载时检查是否可以移除目标
    nextTick(() => {
      const el = document.getElementById(id);
      // 只有当目标元素为空时才移除它
      if (el && (!el.hasChildNodes() || el.childNodes.length === 0)) {
        TeleportTargetManager.removeTarget(id);
      }
    });
  });

  return {
    target,
    selector: `#${id}`,
  };
}

/**
 * 模态框管理器
 * 跟踪活动模态框并管理z-index层级
 */
export const ModalManager = {
  // 基础z-index值
  baseZIndex: 1000,

  // 活动模态框堆栈
  activeModals: [] as string[],

  /**
   * 注册新模态框
   * @param id 模态框ID
   * @returns z-index值
   */
  register(id: string): number {
    // 检查是否已注册
    const existingIndex = this.activeModals.indexOf(id);
    if (existingIndex >= 0) {
      return this.getZIndex(existingIndex);
    }

    // 添加到堆栈并返回z-index
    this.activeModals.push(id);
    return this.getZIndex(this.activeModals.length - 1);
  },

  /**
   * 注销模态框
   * @param id 模态框ID
   */
  unregister(id: string): void {
    const index = this.activeModals.indexOf(id);
    if (index >= 0) {
      this.activeModals.splice(index, 1);
    }
  },

  /**
   * 获取最顶层模态框ID
   * @returns 顶层模态框ID或空字符串
   */
  getTopModal(): string {
    return this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1] : "";
  },

  /**
   * 计算模态框z-index
   * @param index 模态框在堆栈中的索引
   * @returns z-index值
   */
  getZIndex(index: number): number {
    return this.baseZIndex + index * 10;
  },
};

/**
 * 使用模态框Teleport
 * @param id 模态框ID
 * @param initialVisible 初始可见状态
 * @returns 模态框控制对象
 */
export function useModal(id: string, initialVisible: boolean = false) {
  const isVisible = ref(initialVisible);
  const zIndex = ref(ModalManager.baseZIndex);

  // 获取teleport目标
  const { selector } = useTeleportTarget("modal-container", {
    "aria-live": "polite",
    class: "modal-container",
  });

  // 显示模态框
  const show = () => {
    if (!isVisible.value) {
      zIndex.value = ModalManager.register(id);
      isVisible.value = true;
    }
  };

  // 隐藏模态框
  const hide = () => {
    if (isVisible.value) {
      isVisible.value = false;
      ModalManager.unregister(id);
    }
  };

  // 组件卸载时清理
  onBeforeUnmount(() => {
    if (isVisible.value) {
      ModalManager.unregister(id);
    }
  });

  return {
    isVisible,
    zIndex,
    teleportTo: selector,
    show,
    hide,
    toggle: () => (isVisible.value ? hide() : show()),
  };
}

/**
 * 动态组件Teleport
 * 将组件动态传送到指定位置
 * @param component 要传送的组件
 * @param targetSelector 目标选择器
 * @param props 组件属性
 * @returns 控制对象
 */
export function useDynamicTeleport(
  component: Component,
  targetSelector: string = "body",
  props: Record<string, any> = {},
) {
  const isVisible = ref(false);
  const isMounted = ref(false);
  const teleportedInstance: Ref<VNode | null> = ref(null);

  // 显示组件
  const show = async () => {
    isVisible.value = true;

    // 确保DOM已更新
    await nextTick();

    if (!isMounted.value) {
      // 创建组件
      const vnode = h(component, {
        ...props,
        onClose: hide, // 约定组件应支持onClose事件
      });

      // 创建包装元素
      const container = document.createElement("div");

      // 找到目标元素
      const target = targetSelector === "body" ? document.body : document.querySelector(targetSelector);

      if (target) {
        target.appendChild(container);
        teleportedInstance.value = vnode;
        isMounted.value = true;
      } else {
        console.error(`Teleport target "${targetSelector}" not found`);
      }
    }
  };

  // 隐藏组件
  const hide = () => {
    isVisible.value = false;

    // 如果组件实现了自己的隐藏逻辑，可以在此保留实例
    // 或者直接卸载组件:
    // unmount();
  };

  // 卸载组件
  const unmount = () => {
    if (isMounted.value && teleportedInstance.value) {
      const element = teleportedInstance.value.el?.parentElement;
      if (element && element.parentElement) {
        element.parentElement.removeChild(element);
      }
      teleportedInstance.value = null;
      isMounted.value = false;
    }
    isVisible.value = false;
  };

  // 组件卸载时清理
  onBeforeUnmount(unmount);

  return {
    isVisible,
    show,
    hide,
    unmount,
  };
}

/**
 * 创建弹出层组件
 * @param content 弹出层内容组件
 * @param id 弹出层ID
 * @returns 弹出层组件
 */
export function createPopover(content: Component, id: string = "popover-container") {
  return defineComponent({
    name: "DynamicPopover",

    props: {
      to: {
        type: String,
        default: () => `#${id}`,
      },
      position: {
        type: String,
        default: "bottom",
      },
      trigger: {
        type: String,
        default: "click",
      },
      offset: {
        type: Number,
        default: 8,
      },
    },

    setup(props, { slots }) {
      // 确保弹出层容器存在
      const { selector } = useTeleportTarget(id);

      const isOpen = ref(false);
      const triggerElement: Ref<HTMLElement | null> = ref(null);

      // 打开弹出层
      const open = () => {
        isOpen.value = true;
      };

      // 关闭弹出层
      const close = () => {
        isOpen.value = false;
      };

      // 切换弹出层状态
      const toggle = () => {
        isOpen.value = !isOpen.value;
      };

      // 监听点击事件 - 点击外部时关闭
      const handleOutsideClick = (event: MouseEvent) => {
        if (isOpen.value && triggerElement.value && !triggerElement.value.contains(event.target as Node)) {
          const popoverEl = document.getElementById(`${id}-content`);
          if (popoverEl && !popoverEl.contains(event.target as Node)) {
            close();
          }
        }
      };

      // 设置事件监听器
      onMounted(() => {
        if (props.trigger === "click") {
          document.addEventListener("click", handleOutsideClick);
        }
      });

      // 移除事件监听器
      onBeforeUnmount(() => {
        if (props.trigger === "click") {
          document.removeEventListener("click", handleOutsideClick);
        }
      });

      return () => {
        return [
          // 触发元素
          h(
            "div",
            {
              ref: triggerElement,
              onClick: props.trigger === "click" ? toggle : undefined,
              onMouseenter: props.trigger === "hover" ? open : undefined,
              onMouseleave: props.trigger === "hover" ? close : undefined,
            },
            slots.default?.(),
          ),

          // 传送的弹出层内容
          isOpen.value &&
            h("teleport", { to: props.to }, [
              h(
                "div",
                {
                  id: `${id}-content`,
                  class: `popover-content popover-${props.position}`,
                  style: {
                    position: "absolute",
                    zIndex: 2000,
                    // 位置会通过JS动态计算并设置
                  },
                },
                [
                  h(content, {
                    onClose: close,
                  }),
                ],
              ),
            ]),
        ];
      };
    },
  });
}

export default {
  TeleportTargetManager,
  useTeleportTarget,
  ModalManager,
  useModal,
  useDynamicTeleport,
  createPopover,
};
