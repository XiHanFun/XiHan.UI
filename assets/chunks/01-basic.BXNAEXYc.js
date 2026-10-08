var e=`// 单选与行内操作 | 点击行只改变选择，行内按钮执行自己的动作
import type { GridListNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhGridListLabel,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowDescription,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/react";
import { useState } from "react";

const projects: GridListNode[] = [
  { value: "docs", label: "文档站", description: "组件文档与示例" },
  { value: "console", label: "管理后台", description: "运营与权限配置" },
  { value: "mobile", label: "移动端", description: "现场工作台" },
];

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState<string[]>(["docs"]);
  const [message, setMessage] = useState("尚未执行行内操作");
  return (
    <div data-demo-stack>
      <XhGridListRoot value={selected} onValueChange={details => setSelected(details.value)} collection={projects}>
        <XhGridListLabel>项目</XhGridListLabel>
        {projects.map(project => (
          <XhGridListRow key={project.value} value={project.value}>
            <XhGridListRowSelectionIndicator />
            <XhGridListRowContent>
              <XhGridListRowText>{project.label}</XhGridListRowText>
              <XhGridListRowDescription>{project.description}</XhGridListRowDescription>
            </XhGridListRowContent>
            <XhGridListRowActions>
              <XhGridListRowAction onClick={() => setMessage(\`编辑 \${project.label}\`)}>编辑</XhGridListRowAction>
            </XhGridListRowActions>
          </XhGridListRow>
        ))}
      </XhGridListRoot>
      <span data-label>
        已选：
        {selected.join("、")}
        ；
        {message}
      </span>
    </div>
  );
}
`;export{e as default};