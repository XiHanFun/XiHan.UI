import { computed, defineComponent, inject, h } from "vue";
import type { PropType } from "vue";
import { buttonGroupContextKey } from "../../button-group";
import Icon from "../../icon/src/Icon";
import "../styles/index";

// 按钮类型
export type ButtonType = "default" | "primary" | "success" | "warning" | "danger" | "info";
// 按钮尺寸
export type ButtonSize = "small" | "medium" | "large";
// 原生类型
export type NativeType = "button" | "submit" | "reset";
// 图标位置
export type IconPlacement = "left" | "right";

// 导出 props 类型
export type ButtonProps = {
  /** 按钮类型 */
  type?: ButtonType;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 图标名称 */
  icon?: string;
  /** 图标位置 */
  iconPlacement?: IconPlacement;
  /** 图标颜色 */
  iconColor?: string;
  /** 图标尺寸 */
  iconSize?: string | number;
  /** 块级按钮 */
  block?: boolean;
  /** 是否为朴素按钮 */
  plain?: boolean;
  /** 是否为圆角按钮 */
  round?: boolean;
  /** 是否为圆形按钮 */
  circle?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载中 */
  loading?: boolean;
  /** 加载图标名称 */
  loadingIcon?: string;
  /** 按钮原生类型 */
  nativeType?: NativeType;
  /** 自动获取焦点 */
  autofocus?: boolean;
  /** 按钮文本 */
  text?: string;
  /** 是否为文本按钮 */
  textButton?: boolean;
  /** 是否为链接按钮 */
  link?: boolean;
  /** 按钮标题，用于无障碍访问 */
  title?: string;
  /** 按钮标签，用于屏幕阅读器 */
  label?: string;
};

export const buttonProps = {
  // 按钮类型
  type: {
    type: String as PropType<ButtonType>,
    default: "default",
    validator: (val: string): boolean => {
      return ["default", "primary", "success", "warning", "danger", "info"].includes(val);
    },
  },
  // 按钮尺寸
  size: {
    type: String as PropType<ButtonSize>,
    default: "medium",
    validator: (val: string): boolean => {
      return ["small", "medium", "large"].includes(val);
    },
  },
  // 图标
  icon: {
    type: String,
    default: "",
  },
  // 图标位置
  iconPlacement: {
    type: String as PropType<IconPlacement>,
    default: "left",
    validator: (val: string): boolean => {
      return ["left", "right"].includes(val);
    },
  },
  // 图标颜色
  iconColor: {
    type: String,
    default: "",
  },
  // 图标尺寸
  iconSize: {
    type: [String, Number] as PropType<string | number>,
    default: "",
  },
  // 块级按钮
  block: {
    type: Boolean,
    default: false,
  },
  // 是否为朴素按钮
  plain: {
    type: Boolean,
    default: false,
  },
  // 是否为圆角按钮
  round: {
    type: Boolean,
    default: false,
  },
  // 是否为圆形按钮
  circle: {
    type: Boolean,
    default: false,
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 是否显示加载中
  loading: {
    type: Boolean,
    default: false,
  },
  // 加载图标名称
  loadingIcon: {
    type: String,
    default: "bsi-arrow-clockwise",
  },
  // 按钮原生类型
  nativeType: {
    type: String as PropType<NativeType>,
    default: "button",
    validator: (val: string): boolean => {
      return ["button", "submit", "reset"].includes(val);
    },
  },
  // 自动获取焦点
  autofocus: {
    type: Boolean,
    default: false,
  },
  // 按钮文本
  text: {
    type: String,
    default: "",
  },
  // 是否为文本按钮
  textButton: {
    type: Boolean,
    default: false,
  },
  // 是否为链接按钮
  link: {
    type: Boolean,
    default: false,
  },
  // 按钮标题
  title: {
    type: String,
    default: "",
  },
  // 按钮标签
  label: {
    type: String,
    default: "",
  },
};

export default defineComponent({
  name: "XhButton" as const,
  components: {
    Icon,
  },
  props: buttonProps,
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent,
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent,
  },
  setup(props, { slots, emit, attrs }) {
    // 注入按钮组上下文
    const buttonGroupContext = inject(buttonGroupContextKey, undefined);

    // 计算最终尺寸，优先使用按钮组的尺寸
    const buttonSize = computed(() => buttonGroupContext?.size || props.size);
    // 计算最终类型，优先使用按钮组的类型
    const buttonType = computed(() => buttonGroupContext?.type || props.type);
    // 计算是否为朴素按钮
    const isPlain = computed(() => buttonGroupContext?.plain || props.plain);
    // 计算是否为圆角按钮
    const isRound = computed(() => buttonGroupContext?.round || props.round);
    // 计算是否为垂直布局
    const isVertical = computed(() => buttonGroupContext?.vertical || false);

    // 计算是否禁用
    const isDisabled = computed(() => props.disabled || props.loading);

    // 计算图标尺寸
    const iconSize = computed(() => {
      if (props.iconSize) return props.iconSize;

      switch (buttonSize.value) {
        case "small":
          return 14;
        case "large":
          return 18;
        default:
          return 16;
      }
    });

    // 计算 class 类名
    const classes = computed(() => [
      "xh-button",
      {
        [`xh-button--${buttonType.value}`]: buttonType.value,
        [`xh-button--${buttonSize.value}`]: buttonSize.value,
        "is-plain": isPlain.value,
        "is-round": isRound.value,
        "is-circle": props.circle,
        "is-disabled": isDisabled.value,
        "is-loading": props.loading,
        "is-block": props.block,
        "is-text": props.textButton,
        "is-link": props.link,
        "is-in-group": !!buttonGroupContext,
        "is-vertical": isVertical.value,
        [`icon-placement--${props.iconPlacement}`]: (props.icon || slots.icon) && !props.circle,
        "has-icon-only": (props.icon || slots.icon) && !slots.default && !props.text && props.circle,
      },
    ]);

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (isDisabled.value) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      emit("click", event);
    };

    const handleFocus = (event: FocusEvent) => {
      emit("focus", event);
    };

    const handleBlur = (event: FocusEvent) => {
      emit("blur", event);
    };

    // 渲染图标
    const renderIcon = () => {
      if (props.loading) {
        return (
          <span class="xh-button__loading-icon">
            <Icon
              name={props.loadingIcon}
              animation="spin"
              size={iconSize.value}
              color={props.iconColor || "currentColor"}
            />
          </span>
        );
      }

      if (props.icon) {
        return (
          <span class={`xh-button__icon icon-placement--${props.iconPlacement}`}>
            <Icon name={props.icon} size={iconSize.value} color={props.iconColor || "currentColor"} />
          </span>
        );
      }

      if (slots.icon) {
        return <span class="xh-button__icon">{slots.icon()}</span>;
      }

      return null;
    };

    // 渲染内容
    const renderContent = () => {
      const content = slots.default?.() || props.text;
      if (!content && props.circle) return null;

      return <span class="xh-button__content">{content}</span>;
    };

    return () => (
      <button
        class={classes.value}
        disabled={isDisabled.value}
        type={props.nativeType}
        autofocus={props.autofocus}
        title={props.title}
        aria-label={props.label || props.title}
        aria-disabled={isDisabled.value}
        aria-busy={props.loading}
        role="button"
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...attrs}
      >
        {props.iconPlacement === "left" && renderIcon()}
        {renderContent()}
        {props.iconPlacement === "right" && renderIcon()}
      </button>
    );
  },
});
