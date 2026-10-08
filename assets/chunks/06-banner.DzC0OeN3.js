var e=`// 横幅 | banner 把提示贴在页面顶部铺满整行：不取圆角，只在朝向页面内容的块尾画一道描边；关闭后下方内容平移上来
import type { ReactNode } from "react";
import {
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "var(--xh-shape-surface)",
      }}
    >
      <XhAlertRoot banner tone="warning">
        <XhAlertContent>
          <XhAlertTitle>系统将于今晚 23:00 维护</XhAlertTitle>
          <XhAlertDescription>维护约 30 分钟，期间无法提交表单</XhAlertDescription>
        </XhAlertContent>
        <XhAlertCloseTrigger />
      </XhAlertRoot>
      <p style={{ margin: 0, padding: "var(--xh-space-4)", color: "var(--xh-fg-muted)" }}>页面内容</p>
    </div>
  );
}
`;export{e as default};