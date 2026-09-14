// 尺寸 | 提供三种尺寸
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggleGroupRoot collection={options} defaultValue="day" size="sm" />
      <XhToggleGroupRoot collection={options} defaultValue="week" />
      <XhToggleGroupRoot collection={options} defaultValue="month" size="lg" />
    </>
  );
}
