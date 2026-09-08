// 媒体位与操作位 | 一条条目最全的形态：媒体、标题、说明、操作四个位都摆上
import type { ReactNode } from "react";
import {
  XhListItem,
  XhListItemAction,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/react";

const members = [
  { initial: "张", name: "张三", desc: "zhangsan@example.com" },
  { initial: "李", name: "李四", desc: "lisi@example.com" },
];

export default function Demo(): ReactNode {
  return (
    <XhListRoot bordered hoverable split style={{ maxInlineSize: "420px" }}>
      {members.map(m => (
        <XhListItem key={m.name}>
          {/* 媒体位画什么由使用者决定，这里放一个首字头像 */}
          <XhListItemMedia
            style={{
              inlineSize: "32px",
              blockSize: "32px",
              borderRadius: "999px",
              background: "var(--xh-bg-subtle)",
            }}
          >
            {m.initial}
          </XhListItemMedia>
          <XhListItemContent>
            <XhListItemTitle>{m.name}</XhListItemTitle>
            <XhListItemDescription>{m.desc}</XhListItemDescription>
          </XhListItemContent>
          <XhListItemAction>
            <button type="button">移除</button>
          </XhListItemAction>
        </XhListItem>
      ))}
    </XhListRoot>
  );
}
