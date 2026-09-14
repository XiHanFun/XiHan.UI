// 横向排布 | orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "小" },
  { value: "md", label: "中" },
  { value: "lg", label: "大" },
];

export default function Demo(): ReactNode {
  return (
    <XhRadioGroupRoot
      collection={sizes}
      defaultValue="md"
      label="尺寸"
      orientation="horizontal"
    />
  );
}
