// 基础用法 | present 决定内容在不在：变为真时淡入，变为假时淡出，退场播完才撤下
import type { ReactNode } from "react";
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
  XhPresence,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [shown, setShown] = useState(false);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--xh-space-3)" }}>
      <XhButton size="sm" style={{ justifySelf: "start" }} onClick={() => setShown(!shown)}>
        {shown ? "收起提示" : "显示提示"}
      </XhButton>
      <XhPresence present={shown}>
        <XhAlertRoot tone="success">
          <XhAlertContent>
            <XhAlertTitle>设置已保存</XhAlertTitle>
            <XhAlertDescription>新的通知偏好会在下次登录时生效。</XhAlertDescription>
          </XhAlertContent>
        </XhAlertRoot>
      </XhPresence>
    </div>
  );
}
