import { defineComponent, h } from "vue";
import IconBase from "../components/IconBase";
import type { IconBaseProps } from "../components/IconBase";

export interface SourceConfig {
  type: "git";
  localName: string;
  remoteDir: string;
  url: string;
  branch: string;
  hash: string;
}

export interface IconSource {
  id: string;
  name: string;
  path: string;
  contents: {
    files: string;
    formatter: (name: string) => string;
    processWithSVGO?: boolean;
    multiColor?: boolean;
  }[];
  projectUrl: string;
  license: string;
  licenseUrl: string;
  source: SourceConfig;
}

export function createIcon(definition: IconSource) {
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
          () => h("path", { d: definition.path })
        );
    },
  });
}
