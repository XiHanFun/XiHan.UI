const t=`// Action List | 不保留选择，Enter 或点击行触发主操作，行内按钮仍独立
import type { ReactNode } from "react";
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
} from "@xihan-ui/react";
import { useState } from "react";

const commands = [
  { value: "open", label: "打开项目" },
  { value: "duplicate", label: "复制项目" },
  { value: "archive", label: "归档项目" },
];

export default function Demo(): ReactNode {
  const [result, setResult] = useState("等待操作");
  return (
    <div data-demo-stack>
      <XhGridListRoot collection={commands} selectionMode="none" onAction={details => setResult(\`主操作：\${details.value}\`)}>
        {commands.map(command => (
          <XhGridListRow key={command.value} value={command.value}>
            <XhGridListRowContent><XhGridListRowText>{command.label}</XhGridListRowText></XhGridListRowContent>
            <XhGridListRowActions>
              <XhGridListRowAction onClick={() => setResult(\`说明：\${command.label}\`)}>说明</XhGridListRowAction>
            </XhGridListRowActions>
          </XhGridListRow>
        ))}
      </XhGridListRoot>
      <span data-label>{result}</span>
    </div>
  );
}
`;export{t as default};
