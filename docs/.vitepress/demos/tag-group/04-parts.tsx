// 手写部件 | 逐部件自己写，标签里就能塞头像、计数这类自带内容，摘除钮照旧归 cell 管；产出的结构与只交数据那一份完全一致，Tab 位与键盘也一样
import type { CSSProperties, ReactNode } from "react";
import {
  XhTagGroupCell,
  XhTagGroupItem,
  XhTagGroupItemDeleteTrigger,
  XhTagGroupItemText,
  XhTagGroupLabel,
  XhTagGroupList,
  XhTagGroupRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const avatar: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "16px",
  blockSize: "16px",
  borderRadius: "50%",
  background: "var(--xh-bg-subtle)",
  fontSize: "var(--xh-font-size-xs)",
};

export default function Demo(): ReactNode {
  const [members, setMembers] = useState([
    { value: "zhang", label: "张三", initial: "张", tasks: 3 },
    { value: "li", label: "李四", initial: "李", tasks: 8 },
    { value: "wang", label: "王五", initial: "王", tasks: 0 },
  ]);

  const [picked, setPicked] = useState<string[]>(["li"]);

  // 条目的去留归宿主：组件只报「用户要摘这一枚」
  function remove({ value }: { value: string }): void {
    setMembers(list => list.filter(member => member.value !== value));
  }

  return (
    <>
      <XhTagGroupRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={members}
        selectionMode="multiple"
        variant="outline"
        deletable
        onItemDelete={remove}
      >
        <XhTagGroupLabel>协作成员</XhTagGroupLabel>
        <XhTagGroupList>
          {members.map(member => (
            <XhTagGroupItem key={member.value} value={member.value}>
              <XhTagGroupCell>
                {/* 首字头像只是装饰，连打检索取的是 item-text 里那几个字 */}
                <span aria-hidden="true" style={avatar}>{member.initial}</span>
                <XhTagGroupItemText>{member.label}</XhTagGroupItemText>
                <span aria-hidden="true" style={{ color: "var(--xh-fg-muted)" }}>
                  {member.tasks}
                </span>
                <XhTagGroupItemDeleteTrigger />
              </XhTagGroupCell>
            </XhTagGroupItem>
          ))}
        </XhTagGroupList>
      </XhTagGroupRoot>
      <p>{`已选：${picked.length ? picked.join("、") : "（无）"}`}</p>
    </>
  );
}
