import { defineComponent, h } from "vue";
import type { PropType } from "vue";

export interface IconBaseProps {
  size?: number | string;
  color?: string;
  viewBox?: string;
  attributes?: Record<string, string>;
  path?: string;
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
    viewBox: {
      type: String,
      default: "0 0 24 24",
    },
    // 其他类似属性 stroke: "currentColor", stroke-width: "2", stroke-linecap: "round", stroke-linejoin: "round"
    attributes: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    path: {
      type: String,
      default: "",
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        "svg",
        {
          width: props.size,
          height: props.size,
          fill: props.color,
          viewBox: props.viewBox,
          ...props.attributes,
           "path",
        {
          d: props.path,
        },
        },

        slots.default?.(),
      );
  },
});
