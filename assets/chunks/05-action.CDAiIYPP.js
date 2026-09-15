const t=`// 操作 | 将与提示直接相关的短操作放在尾端
import type { ReactNode } from "react";
import {
  XhAlertAction,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%" }}>
      <XhAlertRoot tone="warning">
        <XhAlertContent>
          <XhAlertTitle>配额即将用尽</XhAlertTitle>
          <XhAlertDescription>本月还可处理 120 次请求。</XhAlertDescription>
        </XhAlertContent>
        <XhAlertAction><XhButton size="sm" variant="outline">查看用量</XhButton></XhAlertAction>
      </XhAlertRoot>
    </div>
  );
}
`;export{t as default};
