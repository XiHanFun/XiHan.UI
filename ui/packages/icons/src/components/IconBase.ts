import { defineComponent, h } from "vue";
import type { PropType } from "vue";

export interface IconBaseProps {
  size?: number | string;
  color?: string;
  spin?: boolean;
  rotate?: number;
  viewBox?: string;
}

export default defineComponent({
  name: "IconBase",
  props: {
    size: {
      type: [Number, String] as PropType<number | string>,
      default: "1em",
    },
    color: {
      type: String,
      default: "currentColor",
    },
    spin: {
      type: Boolean,
      default: false,
    },
    rotate: {
      type: Number,
      default: 0,
    },
    viewBox: {
      type: String,
      default: "0 0 24 24",
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        "svg",
        {
          viewBox: props.viewBox,
          width: props.size,
          height: props.size,
          fill: props.color,
          style: {
            transform: props.rotate ? `rotate(${props.rotate}deg)` : undefined,
            animation: props.spin ? "xh-icon-spin 1s infinite linear" : undefined,
          },
        },
        slots.default?.(),
      );
  },
});
