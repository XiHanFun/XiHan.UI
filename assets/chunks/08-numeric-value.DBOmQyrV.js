const n=`// 数字主键 | 条目身份存在 DOM 属性上，值一律是字符串；数字主键在进出两侧各转一次
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const roles = [
  { id: 101, name: "管理员" },
  { id: 102, name: "审核员" },
  { id: 103, name: "访客" },
];

// 条目数据交给组件前先把主键转成字符串
const options = roles.map(r => ({ value: String(r.id), label: r.name }));

export default function Demo(): ReactNode {
  // 业务侧存数字，组件侧收字符串，转换收在进出两侧各一次
  const [roleIds, setRoleIds] = useState<number[]>([101]);
  const picked = roleIds.map(String);

  return (
    <>
      <XhCheckboxGroupRoot
        value={picked}
        onValueChange={details => setRoleIds(details.value.map(Number))}
        collection={options}
        label="角色"
        orientation="horizontal"
        name="role"
      />
      <span>{\`提交给后端：\${roleIds.join("、") || "（无）"}\`}</span>
    </>
  );
}
`;export{n as default};
