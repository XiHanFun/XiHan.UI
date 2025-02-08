import { defineComponent, computed, inject } from "vue";
import type { PropType } from "vue";
import type { IconProps, IconSize, IconTheme, IconRotate, IconConfig } from "../types";

export const BaseIcon = defineComponent({
  name: "XhBaseIcon",
  props: {
    // 基础属性
    size: {
      type: [String, Number] as PropType<IconSize>,
      default: undefined,
    },
    color: String,
    spin: Boolean,
    // 扩展属性
    theme: {
      type: String as PropType<IconTheme>,
      default: undefined,
    },
    rotate: {
      type: Number as PropType<IconRotate>,
      default: 0,
    },
    flip: {
      type: String as PropType<"horizontal" | "vertical">,
    },
    // 交互属性
    clickable: Boolean,
    disabled: Boolean,
  },

  setup(props, { slots, attrs }) {
    const config = inject<IconConfig>("iconConfig", {});

    // 计算最终尺寸
    const iconSize = computed(() => {
      const size = props.size ?? config.defaultSize ?? "medium";
      if (typeof size === "number") return `${size}px`;
      return {
        small: "16px",
        medium: "24px",
        large: "32px",
      }[size];
    });

    // 计算样式
    const iconStyle = computed(() => {
      const styles: Record<string, string> = {};

      if (props.rotate) {
        styles.transform = `rotate(${props.rotate}deg)`;
      }

      if (props.flip === "horizontal") {
        styles.transform = `${styles.transform || ""} scaleX(-1)`;
      } else if (props.flip === "vertical") {
        styles.transform = `${styles.transform || ""} scaleY(-1)`;
      }

      return styles;
    });

    // 计算类名
    const iconClass = computed(() => [
      "xh-icon",
      {
        [`xh-icon--${props.theme || config.defaultTheme}`]: true,
        "is-spinning": props.spin,
        "is-clickable": props.clickable,
        "is-disabled": props.disabled,
      },
    ]);

    return () => (
      <svg
        class={iconClass.value}
        style={iconStyle.value}
        width={iconSize.value}
        height={iconSize.value}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.color || config.defaultColor}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        {...attrs}
      >
        {slots.default?.()}
      </svg>
    );
  },
});
