import { defineComponent } from "vue";
import type { PropType } from "vue";
import "../styles/index";

export type IconProps = {
  name: string;
  size?: string | number;
  color?: string;
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
      default: "1em",
    },
    color: {
      type: String,
      default: "currentColor",
    },
  },
  setup(props) {
    return () => (
      <i
        class={["xh-icon", props.name]}
        style={{
          fontSize: typeof props.size === "number" ? `${props.size}px` : props.size,
          color: props.color,
        }}
      />
    );
  },
});
