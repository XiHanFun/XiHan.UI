var e=`// 内容懒挂载 | 条目多、内容重时 lazyMount 让每个条目第一次展开才挂载内容；再加 unmountOnExit 即只有展开着的条目挂着内容
import type { ReactNode } from "react";
import { XhAccordionRoot } from "@xihan-ui/react";

const items = Array.from({ length: 6 }, (_, i) => ({
  value: \`q\${i + 1}\`,
  label: \`第 \${i + 1} 季度报告\`,
  content: \`第 \${i + 1} 季度的明细在第一次展开时才渲染，收起动画播完即卸载。\`,
}));

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <XhAccordionRoot collection={items} collapsible lazyMount unmountOnExit />
    </div>
  );
}
`;export{e as default};