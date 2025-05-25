import { defineComponent, provide, computed } from "vue";
import type { InjectionKey, PropType } from "vue";
import type { ButtonSize, ButtonType } from "../../button";
import "../styles/index";

export interface ButtonGroupContext {
  size?: ButtonSize;
  type?: ButtonType;
  vertical?: boolean;
  round?: boolean;
  plain?: boolean;
  disabled?: boolean;
}

export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> = Symbol("buttonGroupContextKey");

// 导出 props 类型
export type ButtonGroupProps = {
  /** 统一设置按钮组内按钮的尺寸 */
  size?: ButtonSize;
  /** 统一设置按钮组内按钮的类型 */
  type?: ButtonType;
  /** 是否为垂直按钮组 */
  vertical?: boolean;
  /** 是否为圆角按钮组 */
  round?: boolean;
  /** 是否为朴素按钮组 */
  plain?: boolean;
  /** 是否禁用整个按钮组 */
  disabled?: boolean;
  /** 按钮组标题，用于无障碍访问 */
  title?: string;
  /** 按钮组标签，用于屏幕阅读器 */
  label?: string;
  /** 按钮组角色，用于无障碍访问 */
  role?: "group" | "toolbar" | "radiogroup";
};

export const buttonGroupProps = {
  // 统一设置按钮组内按钮的尺寸
  size: {
    type: String as PropType<ButtonSize>,
    default: "medium",
    validator: (val: string): boolean => {
      return ["small", "medium", "large"].includes(val);
    },
  },
  // 统一设置按钮组内按钮的类型
  type: {
    type: String as PropType<ButtonType>,
    default: "default",
    validator: (val: string): boolean => {
      return ["default", "primary", "success", "warning", "danger", "info"].includes(val);
    },
  },
  // 是否为垂直按钮组
  vertical: {
    type: Boolean,
    default: false,
  },
  // 是否为圆角按钮组
  round: {
    type: Boolean,
    default: false,
  },
  // 是否为朴素按钮组
  plain: {
    type: Boolean,
    default: false,
  },
  // 是否禁用整个按钮组
  disabled: {
    type: Boolean,
    default: false,
  },
  // 按钮组标题
  title: {
    type: String,
    default: "",
  },
  // 按钮组标签
  label: {
    type: String,
    default: "",
  },
  // 按钮组角色
  role: {
    type: String as PropType<"group" | "toolbar" | "radiogroup">,
    default: "group",
    validator: (val: string): boolean => {
      return ["group", "toolbar", "radiogroup"].includes(val);
    },
  },
};

export default defineComponent({
  name: "XhButtonGroup" as const,
  props: buttonGroupProps,
  emits: {
    click: (event: MouseEvent, index: number) => event instanceof MouseEvent && typeof index === "number",
    focus: (event: FocusEvent, index: number) => event instanceof FocusEvent && typeof index === "number",
    blur: (event: FocusEvent, index: number) => event instanceof FocusEvent && typeof index === "number",
  },
  setup(props, { slots, emit, attrs }) {
    // 计算 class 类名
    const classes = computed(() => [
      "xh-button-group",
      {
        "is-vertical": props.vertical,
        "is-round": props.round,
        "is-plain": props.plain,
        "is-disabled": props.disabled,
        [`xh-button-group--${props.size}`]: props.size,
        [`xh-button-group--${props.type}`]: props.type,
      },
    ]);

    // 通过 provide/inject 向子按钮提供信息
    provide(buttonGroupContextKey, {
      size: props.size,
      type: props.type,
      vertical: props.vertical,
      round: props.round,
      plain: props.plain,
      disabled: props.disabled,
    });

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // 查找点击的按钮索引
      const target = event.target as HTMLElement;
      const button = target.closest(".xh-button");
      if (button && event.currentTarget) {
        const buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll(".xh-button"));
        const index = buttons.indexOf(button);
        if (index !== -1) {
          emit("click", event, index);
        }
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest(".xh-button");
      if (button && event.currentTarget) {
        const buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll(".xh-button"));
        const index = buttons.indexOf(button);
        if (index !== -1) {
          emit("focus", event, index);
        }
      }
    };

    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest(".xh-button");
      if (button && event.currentTarget) {
        const buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll(".xh-button"));
        const index = buttons.indexOf(button);
        if (index !== -1) {
          emit("blur", event, index);
        }
      }
    };

    // 键盘导航处理
    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;

      const buttons = Array.from(
        (event.currentTarget as HTMLElement)?.querySelectorAll(".xh-button:not([disabled])") || [],
      ) as HTMLButtonElement[];
      if (buttons.length === 0) return;

      const currentIndex = buttons.findIndex(button => button === event.target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
          break;
        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          event.preventDefault();
          nextIndex = buttons.length - 1;
          break;
        default:
          return;
      }

      buttons[nextIndex]?.focus();
    };

    return () => (
      <div
        class={classes.value}
        role={props.role}
        title={props.title}
        aria-label={props.label || props.title}
        aria-disabled={props.disabled}
        aria-orientation={props.vertical ? "vertical" : "horizontal"}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeydown={handleKeydown}
        {...attrs}
      >
        {slots.default?.()}
      </div>
    );
  },
});
