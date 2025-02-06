import { computed, defineComponent, inject, h } from "vue";
import type { PropType } from "vue";
import { buttonGroupContextKey } from "./ButtonGroup";

// 按钮类型
type ButtonType = "default" | "primary" | "success" | "warning" | "danger";
// 按钮尺寸
type ButtonSize = "small" | "medium" | "large";

// 导出 props 类型
export type ButtonProps = typeof buttonProps;

export const buttonProps = {
  // 按钮类型
  type: {
    type: String as PropType<ButtonType>,
    default: "default",
  },
  // 按钮尺寸
  size: {
    type: String as PropType<ButtonSize>,
    default: "medium",
  },
  // 是否为朴素按钮
  plain: Boolean,
  // 是否为圆角按钮
  round: Boolean,
  // 是否为圆形按钮
  circle: Boolean,
  // 是否禁用
  disabled: Boolean,
  // 是否显示加载中
  loading: Boolean,
  // 按钮原生类型
  nativeType: {
    type: String as PropType<"button" | "submit" | "reset">,
    default: "button",
  },
  // 自动获取焦点
  autofocus: Boolean,
};

export default defineComponent({
  name: "XhButton",

  props: buttonProps,

  setup(props, { slots }) {
    // 注入按钮组上下文
    const buttonGroupContext = inject(buttonGroupContextKey, undefined);

    // 计算最终尺寸，优先使用按钮组的尺寸
    const buttonSize = computed(() => buttonGroupContext?.size || props.size);

    // 计算 class 类名
    const classes = computed(() => [
      "xh-button",
      `xh-button--${props.type}`,
      `xh-button--${buttonSize.value}`,
      {
        "is-plain": props.plain,
        "is-round": props.round,
        "is-circle": props.circle,
        "is-disabled": props.disabled,
        "is-loading": props.loading,
        "is-in-group": !!buttonGroupContext,
      },
    ]);

    return () => (
      <button
        class={classes.value}
        disabled={props.disabled || props.loading}
        type={props.nativeType}
        autofocus={props.autofocus}
        // 添加 WAI-ARIA 属性增强可访问性
        role="button"
        aria-disabled={props.disabled || props.loading}
      >
        {props.loading && <span class="xh-button__loading-icon"></span>}
        <span class="xh-button__content">{slots.default?.()}</span>
      </button>
    );
  },
});
