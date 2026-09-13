const a=`// 基础用法 | 一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/react";

const members = [
  { label: "曦", tone: "brand" },
  { label: "寒", tone: "success" },
  { label: "懿", tone: "warning" },
  { label: "承", tone: "info" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot>
      {members.map(member => (
        <XhAvatarRoot key={member.label} tone={member.tone}>
          <XhAvatarFallback>{member.label}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}
    </XhAvatarGroupRoot>
  );
}
`;export{a as default};
