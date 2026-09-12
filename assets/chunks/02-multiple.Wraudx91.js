const n=`// 多项展开 | multiple 允许多项并存，展开集合恒为 string[]，受控绑定即可拿到它
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "basic", label: "基础属性", content: "value、defaultValue、multiple。" },
  {
    value: "size",
    label: "排版",
    content: "orientation 决定方向键走哪条轴，默认 vertical。",
  },
  {
    value: "events",
    label: "事件",
    content: "value-change 携带 { value }，update:value 携带裸数组。",
  },
];

export default function Demo(): ReactNode {
  const [panels, setPanels] = useState<string[]>(["basic", "size"]);

  return (
    <div style={{ width: "100%", maxWidth: "420px", display: "grid", gap: "12px" }}>
      <XhAccordionRoot
        value={panels}
        onValueChange={details => setPanels(details.value)}
        collection={items}
        multiple
      />
      <span>{\`展开：\${panels.length ? panels.join("、") : "（无）"}\`}</span>
    </div>
  );
}
`;export{n as default};
