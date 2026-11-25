// 退场完成 | exit-complete 在退场动画播完、内容撤下之后才发，「退场中」与「已撤下」由它分开；退场途中改回在场不发
import type { ReactNode } from "react";
import {
  XhAlertContent,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
  XhPresence,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [shown, setShown] = useState(true);
  const [status, setStatus] = useState("在场");

  const toggle = (): void => {
    setShown(!shown);
    setStatus(shown ? "退场中" : "在场");
  };

  return (
    <>
      <div style={{ inlineSize: "100%", display: "grid", gap: "var(--xh-space-3)" }}>
        <XhButton size="sm" style={{ justifySelf: "start" }} onClick={toggle}>
          {shown ? "收起" : "显示"}
        </XhButton>
        <XhPresence present={shown} onExitComplete={() => setStatus("已撤下")}>
          <XhAlertRoot>
            <XhAlertContent>
              <XhAlertTitle>这条提示撤下之后才算处理完</XhAlertTitle>
            </XhAlertContent>
          </XhAlertRoot>
        </XhPresence>
      </div>
      <span data-demo-output>{`状态：${status}`}</span>
    </>
  );
}
