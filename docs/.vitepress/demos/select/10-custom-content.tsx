// 选项里的自定义内容 | 条目与触发器显示的内容都由你写：想写什么写什么，选中与键盘行为不变
import type { ReactNode } from "react";
import {
  XhAvatarFallback,
  XhAvatarImage,
  XhAvatarRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const members = [
  { value: "liuyi", name: "刘一", initial: "刘", team: "设计组" },
  { value: "chener", name: "陈二", initial: "陈", team: "前端组" },
  { value: "zhangsan", name: "张三", initial: "张", team: "服务端组" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["liuyi"]);
  const current = members.find(m => m.value === picked[0]) ?? null;

  return (
    <XhSelectRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      placeholder="请选择成员"
    >
      <XhSelectLabel>负责人</XhSelectLabel>
      <XhSelectControl>
        <XhSelectTrigger>
          <XhSelectValueText>
            {current
              ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <XhAvatarRoot size="sm">
                      <XhAvatarImage />
                      <XhAvatarFallback>{current.initial}</XhAvatarFallback>
                    </XhAvatarRoot>
                    {current.name}
                  </span>
                )
              : <span>请选择成员</span>}
          </XhSelectValueText>
          <XhSelectIndicator />
        </XhSelectTrigger>
      </XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            {members.map(m => (
              <XhSelectItem key={m.value} value={m.value}>
                <XhSelectItemText>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <XhAvatarRoot size="sm">
                      <XhAvatarImage />
                      <XhAvatarFallback>{m.initial}</XhAvatarFallback>
                    </XhAvatarRoot>
                    <span>
                      {m.name}
                      <span style={{ color: "var(--xh-fg-muted)", fontSize: "12px" }}>{m.team}</span>
                    </span>
                  </span>
                </XhSelectItemText>
                <XhSelectItemIndicator />
              </XhSelectItem>
            ))}
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  );
}
