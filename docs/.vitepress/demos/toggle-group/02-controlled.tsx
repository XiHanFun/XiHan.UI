// 受控状态 | 由外部状态控制选中值
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("week");
  return (
    <XhToggleGroupRoot
      value={value}
      collection={options}
      disallowEmpty
      onValueChange={details => setValue(details.value as string | null)}
    />
  );
}
