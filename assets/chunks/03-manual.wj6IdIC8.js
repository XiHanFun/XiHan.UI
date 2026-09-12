const n=`// 手动激活 | activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板
import type { ReactNode } from "react";
import { XhTabsRoot } from "@xihan-ui/react";

const tabs = [
  { value: "daily", label: "日报" },
  { value: "weekly", label: "周报" },
  { value: "monthly", label: "月报" },
];

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot
      collection={tabs}
      defaultValue="daily"
      activationMode="manual"
      style={{ inlineSize: "100%" }}
      renderPanel={node => \`\${node.label}面板\`}
    />
  );
}
`;export{n as default};
