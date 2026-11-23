// 点行看详情 | actionOnClick 让点行触发行主操作（看详情），勾选只由行首方框与 Space 改变，适合一边勾选做批量操作、一边点开某一行
import type { GridListNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhGridListLabel,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowDescription,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/react";
import { useState } from "react";

const keys: GridListNode[] = [
  { value: "user:global", label: "user:global", description: "全局偏好" },
  { value: "user:guide", label: "user:guide", description: "引导进度" },
  { value: "user:welcome", label: "user:welcome", description: "欢迎页状态" },
];

export default function Demo(): ReactNode {
  const [checked, setChecked] = useState<string[]>([]);
  const [detail, setDetail] = useState("（未打开）");

  return (
    <div data-demo-stack>
      <XhGridListRoot
        value={checked}
        onValueChange={details => setChecked(details.value)}
        collection={keys}
        selectionMode="multiple"
        actionOnClick
        onAction={details => setDetail(details.value)}
      >
        <XhGridListLabel>缓存键</XhGridListLabel>
        {keys.map(key => (
          <XhGridListRow key={key.value} value={key.value}>
            <XhGridListRowSelectionIndicator />
            <XhGridListRowContent>
              <XhGridListRowText>{key.label}</XhGridListRowText>
              <XhGridListRowDescription>{key.description}</XhGridListRowDescription>
            </XhGridListRowContent>
          </XhGridListRow>
        ))}
      </XhGridListRoot>
      <span data-demo-output>{`详情：${detail} · 已勾选：${checked.length ? checked.join("、") : "（无）"}`}</span>
    </div>
  );
}
