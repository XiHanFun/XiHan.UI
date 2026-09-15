const n=`// 基础用法 | 从成员列表中选择一项
import type { ReactNode } from "react";
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/react";

const members = [
  { value: "lin", name: "林知夏", email: "lin@xihan.dev", initial: "林" },
  { value: "chen", name: "陈望舒", email: "chen@xihan.dev", initial: "陈" },
  { value: "zhou", name: "周予安", email: "zhou@xihan.dev", initial: "周" },
];

export default function Demo(): ReactNode {
  return (
    <XhListboxRoot defaultValue={["lin"]} style={{ inlineSize: "min(100%, 300px)" }}>
      <XhListboxLabel>团队成员</XhListboxLabel>
      <XhListboxContent>
        {members.map(member => (
          <XhListboxItem key={member.value} value={member.value}>
            <span
              aria-hidden="true"
              style={{ display: "grid", flex: "none", placeItems: "center", inlineSize: "32px", blockSize: "32px", borderRadius: "999px", background: "var(--xh-bg-brand-subtle)", color: "var(--xh-fg-brand-strong)", fontWeight: 600 }}
            >
              {member.initial}
            </span>
            <XhListboxItemText>
              <span style={{ display: "grid", gap: "2px" }}>
                <span>{member.name}</span>
                <span style={{ color: "var(--xh-fg-subtle)", fontSize: "var(--xh-text-caption-size)" }}>{member.email}</span>
              </span>
            </XhListboxItemText>
            <XhListboxItemIndicator />
          </XhListboxItem>
        ))}
      </XhListboxContent>
    </XhListboxRoot>
  );
}
`;export{n as default};
