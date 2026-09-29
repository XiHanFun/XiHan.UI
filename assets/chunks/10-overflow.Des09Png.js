const n=`// 更多下拉 | 标签带放不下时，行尾的更多按钮列出可见区外的标签，选中即切过去
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsOverflowTrigger,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

const branches = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安", "南京", "重庆"];

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="北京" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="分公司">
        {branches.map(branch => (
          <XhTabsTrigger key={branch} value={branch}>
            {\`\${branch}分公司\`}
          </XhTabsTrigger>
        ))}
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsOverflowTrigger />

      {branches.map(branch => (
        <XhTabsContent key={branch} value={branch}>
          {\`\${branch}分公司的本月业绩。\`}
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  );
}
`;export{n as default};
