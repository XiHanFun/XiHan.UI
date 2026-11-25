// 退场后保留内容 | unmountOnExit 缺省为真，退场播完即卸载，再出现时里面的输入已清空；设为 false 时只藏起 root，输入原样保留
import type { ReactNode } from "react";
import {
  XhButton,
  XhPresence,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [shown, setShown] = useState(true);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--xh-space-3)" }}>
      <XhButton size="sm" style={{ justifySelf: "start" }} onClick={() => setShown(!shown)}>
        {shown ? "收起两块" : "显示两块"}
      </XhButton>
      <XhPresence present={shown}>
        <XhTextFieldRoot placeholder="输入后收起再显示，内容已清空">
          <XhTextFieldLabel>退场后卸载</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhPresence>
      <XhPresence present={shown} unmountOnExit={false}>
        <XhTextFieldRoot placeholder="输入后收起再显示，内容还在">
          <XhTextFieldLabel>退场后保留</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </XhPresence>
    </div>
  );
}
