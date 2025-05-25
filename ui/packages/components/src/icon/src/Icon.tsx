import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { IconBase } from "@xihan-ui/icons";
import "../styles/index";

export type IconProps = {
  /** 图标名称 */
  name: string;
  /** 图标大小，支持数字（px）或字符串（em, rem等） */
  size?: string | number;
  /** 图标颜色 */
  color?: string;
  /** 图标标题，用于无障碍访问 */
  title?: string;
  /** 图标缩放比例 */
  scale?: number | string;
  /** 图标动画效果 */
  animation?: "spin" | "spin-pulse" | "wrench" | "ring" | "pulse" | "flash" | "float";
  /** 图标翻转方向 */
  flip?: "horizontal" | "vertical" | "both";
  /** 动画速度 */
  speed?: "fast" | "slow";
  /** 图标标签，用于屏幕阅读器 */
  label?: string;
  /** 是否启用悬停效果 */
  hover?: boolean;
  /** 是否反转颜色 */
  inverse?: boolean;
};

export default defineComponent({
  name: "XhIcon",
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    color: {
      type: String,
      default: "currentColor",
    },
    title: {
      type: String,
      default: undefined,
    },
    scale: {
      type: [Number, String] as PropType<number | string>,
      default: 1,
    },
    animation: {
      type: String as PropType<"spin" | "spin-pulse" | "wrench" | "ring" | "pulse" | "flash" | "float">,
      default: undefined,
      validator: (val: string): boolean => {
        return ["spin", "spin-pulse", "wrench", "ring", "pulse", "flash", "float"].includes(val);
      },
    },
    flip: {
      type: String as PropType<"horizontal" | "vertical" | "both">,
      default: undefined,
      validator: (val: string): boolean => {
        return ["horizontal", "vertical", "both"].includes(val);
      },
    },
    speed: {
      type: String as PropType<"fast" | "slow">,
      default: undefined,
      validator: (val: string): boolean => {
        return ["fast", "slow"].includes(val);
      },
    },
    label: {
      type: String,
      default: undefined,
    },
    hover: {
      type: Boolean,
      default: false,
    },
    inverse: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      // 计算最终的缩放值
      let finalScale = Number(props.scale);

      // 如果设置了 size 属性，将其转换为缩放比例
      if (props.size !== undefined) {
        if (typeof props.size === "number") {
          // 数字类型，假设是像素值，转换为相对于 24px 的比例
          finalScale = props.size / 24;
        } else if (typeof props.size === "string") {
          // 字符串类型，尝试解析数值部分
          const match = props.size.match(/^(\d+(?:\.\d+)?)(.*)?$/);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2] || "px";

            if (unit === "px") {
              finalScale = value / 24;
            } else if (unit === "em" || unit === "rem") {
              finalScale = value;
            }
          }
        }
      }

      // 构建传递给 IconBase 的属性
      const iconBaseProps = {
        name: props.name,
        title: props.title,
        fill: props.color,
        scale: finalScale,
        animation: props.animation,
        flip: props.flip,
        speed: props.speed,
        label: props.label,
        hover: props.hover,
        inverse: props.inverse,
        ...attrs, // 传递其他属性
      };

      return h(IconBase, iconBaseProps, slots);
    };
  },
});
