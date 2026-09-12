const e=`// 竖排 | orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面
import type { ReactNode } from "react";
import { XhTabsRoot } from "@xihan-ui/react";

const tabs = [
  { value: "general", label: "通用" },
  { value: "appearance", label: "外观" },
  { value: "advanced", label: "高级" },
];

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot
      collection={tabs}
      defaultValue="general"
      orientation="vertical"
      style={{ inlineSize: "100%" }}
      renderPanel={node => \`\${node.label}设置面板\`}
    />
  );
}
`;export{e as default};
