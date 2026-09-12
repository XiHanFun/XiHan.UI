// 尺寸 | 适配不同的界面密度
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhCheckbox size="sm" defaultChecked>小</XhCheckbox>
      <XhCheckbox defaultChecked>中</XhCheckbox>
      <XhCheckbox size="lg" defaultChecked>大</XhCheckbox>
    </div>
  );
}
