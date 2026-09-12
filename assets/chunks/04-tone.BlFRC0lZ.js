const n=`// 语气 | 在 content 上写 data-tone，确认按钮跟着换色；语气是共享的一层，不是本组件的 prop
import type { ReactNode } from "react";
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
} from "@xihan-ui/react";

const tones = ["brand", "danger", "warning"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(tone => (
        <XhPopconfirmRoot key={tone} size="sm">
          <XhPopconfirmTrigger>{tone}</XhPopconfirmTrigger>
          <XhPopconfirmPositioner>
            <XhPopconfirmContent data-tone={tone}>
              <XhPopconfirmDescription>确定要执行这一步吗？</XhPopconfirmDescription>
              <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
              <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
            </XhPopconfirmContent>
          </XhPopconfirmPositioner>
        </XhPopconfirmRoot>
      ))}
    </div>
  );
}
`;export{n as default};
