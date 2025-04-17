import { defineComponent, h } from "vue";
import IconBase from "../components/IconBase";
import type { IconBaseProps } from "../components/IconBase";

export interface IconDefinition {
  name: string;
  path: string;
}

export function createIcon(definition: IconDefinition) {
  return defineComponent({
    name: definition.name,
    inheritAttrs: false,
    props: {
      size: {
        type: [Number, String],
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
    setup(props: IconBaseProps) {
      return () =>
        h(
          IconBase,
          {
            ...props,
          },
          () => h("path", { d: definition.path }),
        );
    },
  });
}
