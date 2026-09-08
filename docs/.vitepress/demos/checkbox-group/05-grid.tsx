// 栅格排布 | 组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列
import type { ReactNode } from "react";
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const cities = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "chengdu", label: "成都" },
  { value: "hangzhou", label: "杭州" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["beijing", "chengdu"]);

  return (
    <XhCheckboxGroupRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px 16px" }}
    >
      <XhCheckboxGroupLabel style={{ gridColumn: "1 / -1" }}>开通城市</XhCheckboxGroupLabel>
      {cities.map(c => (
        <XhCheckboxGroupItem key={c.value} value={c.value}>
          <XhCheckboxGroupIndicator />
          <XhCheckboxGroupItemText>{c.label}</XhCheckboxGroupItemText>
        </XhCheckboxGroupItem>
      ))}
    </XhCheckboxGroupRoot>
  );
}
