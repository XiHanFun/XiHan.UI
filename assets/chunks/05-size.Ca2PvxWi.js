const n=`// 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比
import type { ReactNode } from "react";
import { XhMenuRoot } from "@xihan-ui/react";

const account = [
  { value: "profile", label: "个人资料" },
  { value: "settings", label: "偏好设置" },
  { value: "logout", label: "退出登录" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <XhMenuRoot collection={account} size="sm" trigger="sm" />

      {/* 不写 size 就是缺省档 */}
      <XhMenuRoot collection={account} trigger="缺省" />

      <XhMenuRoot collection={account} size="lg" trigger="lg" />
    </div>
  );
}
`;export{n as default};
