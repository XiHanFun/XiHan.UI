import { computed, defineComponent, inject, h } from "vue";
import type { PropType } from "vue";
import {
  createSimpleStyleEngine,
  provideSimpleStyleEngine,
  useSimpleStyleEngine,
  provideSimpleTheme,
  useSimpleTheme,
  simpleCx,
  ref,
  type SimpleTheme,
} from "@xihan-ui/themes";
import { buttonGroupContextKey } from "../../button-group";
import Icon from "../../icon/src/Icon";
import { useButtonStyles } from "./Button.simple-styles";

// 按钮类型
export type ButtonType = "default" | "primary" | "success" | "warning" | "danger" | "info" | "text" | "link";
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
      return ["default", "primary", "success", "warning", "danger", "info", "text", "link"].includes(val);
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

// 默认主题
const defaultTheme: SimpleTheme = {
  colors: {
    primary: "#409eff",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    white: "#ffffff",
    black: "#000000",
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
  },
  spacings: {
    xs: "4px",
    sm: "8px",
    base: "12px",
    lg: "16px",
    xl: "24px",
  },
  borderRadius: {
    sm: "2px",
    base: "4px",
    lg: "8px",
    round: "20px",
  },
};

export default defineComponent({
  name: "XhButtonCssInJs" as const,
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
    // 初始化样式引擎和主题
    const styleEngine = createSimpleStyleEngine();
    const theme = ref(defaultTheme);

    provideSimpleStyleEngine(styleEngine);
    provideSimpleTheme(theme);

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

    // 使用样式
    const buttonStyleClass = useButtonStyles({
      type: buttonType.value,
      size: buttonSize.value,
      plain: isPlain.value,
      loading: props.loading,
      disabled: props.disabled,
      block: props.block,
      round: isRound.value,
      circle: props.circle,
    });

    // 计算类名
    const buttonClass = computed(() => {
      return simpleCx("xh-button", buttonStyleClass.value, {
        [`xh-button--${buttonType.value}`]: buttonType.value !== "default",
        [`xh-button--${buttonSize.value}`]: buttonSize.value !== "medium",
        "is-plain": isPlain.value,
        "is-round": isRound.value,
        "is-circle": props.circle,
        "is-block": props.block,
        "is-disabled": props.disabled,
        "is-loading": props.loading,
        [`icon-placement--${props.iconPlacement}`]: props.icon && props.iconPlacement === "right",
      });
    });

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
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
        return h(Icon, {
          name: props.loadingIcon,
          color: props.iconColor,
          size: props.iconSize,
          class: "xh-button__loading-icon",
          spin: true,
        });
      }

      if (props.icon) {
        return h(Icon, {
          name: props.icon,
          color: props.iconColor,
          size: props.iconSize,
          class: "xh-button__icon",
        });
      }

      return null;
    };

    // 渲染内容
    const renderContent = () => {
      const content = slots.default?.() || (props.text ? [props.text] : []);

      if (content.length === 0 && !props.icon && !props.loading) {
        return null;
      }

      return h("span", { class: "xh-button__content" }, content);
    };

    return () => {
      const iconNode = renderIcon();
      const contentNode = renderContent();

      return h(
        "button",
        {
          ...attrs,
          type: props.nativeType,
          class: buttonClass.value,
          disabled: props.disabled || props.loading,
          autofocus: props.autofocus,
          title: props.title,
          "aria-label": props.label,
          "aria-disabled": props.disabled || props.loading,
          "aria-busy": props.loading,
          onClick: handleClick,
          onFocus: handleFocus,
          onBlur: handleBlur,
        },
        [props.iconPlacement === "left" && iconNode, contentNode, props.iconPlacement === "right" && iconNode].filter(
          Boolean,
        ),
      );
    };
  },
});
