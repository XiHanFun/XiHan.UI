// 对象值 | 选项直接用接口取回来的对象：value 与值变化交出的都是对象本身，给 valueKey 按 id 认，同一个人换成内容相同的新对象也选得中
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";
import { useState } from "react";

interface Member {
  id: number;
  name: string;
  team: string;
}

const members: Member[] = [
  { id: 1, name: "赵一", team: "平台研发" },
  { id: 2, name: "钱二", team: "前端体验" },
  { id: 3, name: "孙三", team: "基础架构" },
  { id: 4, name: "李四", team: "质量保障" },
];

const options = members.map(member => ({ value: member, label: member.name, description: member.team }));

export default function Demo(): ReactNode {
  // 初值是另一份内容相同的对象（比如从地址栏还原的），按 id 认得出来
  const [picked, setPicked] = useState<Member[]>([{ id: 2, name: "钱二", team: "前端体验" }]);
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%", maxWidth: "320px" }}>
      <XhSelectRoot
        multiple
        value={picked}
        valueKey="id"
        collection={options}
        onValueChange={({ value }) => setPicked(value)}
        label="负责人"
        placeholder="请选择"
      />
      <span data-demo-output>{picked.map(member => `${member.name}（${member.team}）`).join("、") || "未选"}</span>
    </div>
  );
}
