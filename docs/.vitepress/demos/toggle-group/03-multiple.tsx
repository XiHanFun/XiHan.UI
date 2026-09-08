// 多选 | multiple 换的是整套 ARIA：root 退回 group、条目退回原生按钮 + aria-pressed，值也从字符串变成数组
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const markOptions = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

const overlays = [
  { value: "grid", label: "网格" },
  { value: "ruler", label: "标尺" },
  { value: "guide", label: "参考线" },
];

export default function Demo(): ReactNode {
  const [marks, setMarks] = useState<string[]>(["bold"]);

  return (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <XhToggleGroupRoot
          value={marks}
          onValueChange={details => setMarks(details.value as string[])}
          collection={markOptions}
          multiple
        />
        <span style={{ fontSize: "13px" }}>
          {`当前：${marks.join("、") || "（无选中）"}`}
        </span>
      </span>

      {/* 竖排只改视觉排布，方向键接受的轴与它无关，四个方向键恒响应 */}
      <XhToggleGroupRoot
        collection={overlays}
        defaultValue={["grid"]}
        multiple
        orientation="vertical"
      />
    </>
  );
}
