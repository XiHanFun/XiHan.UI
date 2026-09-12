const n=`// 尺寸与描边 | size 八档改直径（text 跟着相邻文字的字号走）、weight 三档改 stroke-width；缺省档 md 不落 data-* 属性，皮肤的基础规则就是缺省档
import type { CSSProperties, ReactNode } from "react";
import { XhIcon } from "@xihan-ui/react";

const StarIcon = {
  name: "star",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    {
      tag: "path",
      attrs: {
        d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
      },
    },
  ],
} as const;

const row: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
};

export default function Demo(): ReactNode {
  return (
    <>
      <span style={row}>
        <XhIcon icon={StarIcon} size="text" />
        <XhIcon icon={StarIcon} size="sm" />
        <XhIcon icon={StarIcon} />
        <XhIcon icon={StarIcon} size="lg" />
        <XhIcon icon={StarIcon} size="xl" />
        <span style={{ fontSize: "13px" }}>text / sm / md（缺省）/ lg / xl，另有 2xl / 3xl / 4xl</span>
      </span>

      <span style={row}>
        <XhIcon icon={StarIcon} size="lg" weight="light" />
        <XhIcon icon={StarIcon} size="lg" />
        <XhIcon icon={StarIcon} size="lg" weight="bold" />
        <span style={{ fontSize: "13px" }}>light / regular（缺省）/ bold</span>
      </span>
    </>
  );
}
`;export{n as default};
