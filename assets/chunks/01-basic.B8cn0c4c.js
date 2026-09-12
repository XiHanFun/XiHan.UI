const n=`// 基础用法 | 定直径的圆底座，图元在正中；底座换档时里面的图元跟着一起换
import type { ReactNode } from "react";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const BellIcon = {
  name: "bell",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M6 9a6 6 0 0 1 12 0c0 4 1 5.5 2 6.5H4c1-1 2-2.5 2-6.5Z" } },
    { tag: "path", attrs: { d: "M10 19a2 2 0 0 0 4 0" } },
  ],
} as const;

export default function Demo(): ReactNode {
  return (
    <XhIconWrapper>
      <XhIcon icon={BellIcon} />
    </XhIconWrapper>
  );
}
`;export{n as default};
