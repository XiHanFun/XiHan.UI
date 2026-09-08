// 可及名字 | 命名只有两态：给了非空白 label 就是 role="img" + aria-label，没给就是 aria-hidden="true" 的装饰件
import type { CSSProperties, ReactNode } from "react";
import { XhIcon } from "@xihan-ui/react";

const PlusIcon = {
  name: "plus",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 5V19" } },
    { tag: "path", attrs: { d: "M5 12H19" } },
  ],
} as const;

const XIcon = {
  name: "x",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M6 6L18 18" } },
    { tag: "path", attrs: { d: "M18 6L6 18" } },
  ],
} as const;

const row: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

export default function Demo(): ReactNode {
  return (
    <>
      {/* 旁边已经有文字说这件事，图标不给 label，读屏不会把「加号 新建」念两遍 */}
      <span style={row}>
        <XhIcon icon={PlusIcon} />
        新建
      </span>

      {/* 图标是这里唯一说出「关闭」的东西，必须给 label */}
      <span style={row}>
        <XhIcon icon={XIcon} label="关闭" />
        <span style={{ fontSize: "13px" }}>这枚没有可见文字，名字只能由 label 给</span>
      </span>
    </>
  );
}
