// 模态浮层 | modal 让焦点陷在浮层里：Tab 到末尾回绕，旁边那颗按钮这时接不到焦点
import type { ReactNode } from "react";
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const groups = ["收件箱", "待办", "归档"];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState("收件箱");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhPopoverRoot modal placement="bottom-start" translations={{ close: "关闭" }}>
        <XhPopoverTrigger>移动到分组</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>移动到分组</XhPopoverTitle>
            <XhPopoverDescription>按 Tab 试试，焦点只在浮层里打转。</XhPopoverDescription>
            <div style={{ display: "flex", gap: "8px" }}>
              {groups.map(g => (
                <XhButton key={g} size="sm" variant="outline" onClick={() => setPicked(g)}>
                  {g}
                </XhButton>
              ))}
            </div>
            <XhPopoverCloseTrigger />
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>

      <XhButton variant="ghost">页面上的另一颗按钮</XhButton>
      <span>{`当前分组：${picked}`}</span>
    </div>
  );
}
