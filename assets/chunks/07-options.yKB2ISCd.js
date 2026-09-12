const e=`// 数据驱动 | 自家字段叫什么由数据定，映射成条目的值、文本与禁用即可
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";
import { useMemo, useState } from "react";

const levels = [
  { code: "p0", text: "紧急", locked: false },
  { code: "p1", text: "高", locked: false },
  { code: "p2", text: "普通", locked: false },
  { code: "p3", text: "低", locked: true },
];

export default function Demo(): ReactNode {
  const [level, setLevel] = useState<string | null>("p1");
  const collection = useMemo(
    () => levels.map(lv => ({ value: lv.code, label: lv.text, disabled: lv.locked })),
    [],
  );

  return (
    <>
      <XhRadioGroupRoot
        value={level}
        onValueChange={details => setLevel(details.value)}
        collection={collection}
        label="优先级"
        name="level"
        orientation="horizontal"
      />
      <span>{\`当前：\${level ?? "（未选）"}\`}</span>
    </>
  );
}
`;export{e as default};
