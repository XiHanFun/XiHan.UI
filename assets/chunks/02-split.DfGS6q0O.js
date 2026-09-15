const t=`// 分隔线 | split 在条目之间画一条线，第一条上面不画
import type { ReactNode } from "react";
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/react";

const logs = ["提交了一次构建", "合并了一个分支", "关闭了一个议题"];

export default function Demo(): ReactNode {
  return (
    <XhListRoot split style={{ maxInlineSize: "360px" }}>
      {logs.map(log => (
        <XhListItem key={log}>
          <XhListItemContent>
            <XhListItemTitle>{log}</XhListItemTitle>
          </XhListItemContent>
        </XhListItem>
      ))}
    </XhListRoot>
  );
}
`;export{t as default};
