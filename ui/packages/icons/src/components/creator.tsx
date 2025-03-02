import { defineComponent, h } from "vue";
import IconBase from "./IconBase";
import type { PropType } from "vue";
import type { IconBaseProps } from "./IconBase";

export interface IconProps extends IconBaseProps {
  path: string;
  name: string;
}

export const createIcon = (options: Omit<IconProps, keyof IconBaseProps>) => {
  return defineComponent({
    name: options.name,
    inheritAttrs: false,
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
    },
    setup(props, { attrs }) {
      return () =>
        h(
          IconBase,
          {
            ...props,
            ...attrs,
          },
          {
            default: () => h("path", { d: options.path }),
          }
        );
    },
  });
};
