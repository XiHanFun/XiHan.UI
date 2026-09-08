// 受控与不可清空 | 传了 value 就由宿主说了算；单选组再点一次当前项会清空成 null，disallow-empty 把这一手关掉
import type { ReactNode } from "react";
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [align, setAlign] = useState<string | null>("left");
  const [density, setDensity] = useState<string | null>("comfortable");

  return (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <XhToggleGroupRoot
          value={align}
          onValueChange={details => setAlign(details.value as string | null)}
        >
          <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
          <XhToggleGroupItem value="center">居中</XhToggleGroupItem>
          <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
        </XhToggleGroupRoot>
        <span style={{ fontSize: "13px" }}>{`当前：${align ?? "（无选中）"}`}</span>
      </span>

      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <XhToggleGroupRoot
          value={density}
          onValueChange={details => setDensity(details.value as string | null)}
          disallowEmpty
        >
          <XhToggleGroupItem value="compact">紧凑</XhToggleGroupItem>
          <XhToggleGroupItem value="comfortable">宽松</XhToggleGroupItem>
        </XhToggleGroupRoot>
        <span style={{ fontSize: "13px" }}>{`disallow-empty：${density}，点不成空`}</span>
      </span>
    </>
  );
}
