const n=`// 遮罩形态 | variant 只落在 backdrop 那一层：opaque 压一层底、blur 糊掉背后、transparent 只挡点击
import type { CommandNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhCommandRoot } from "@xihan-ui/react";

const commands: CommandNode[] = [
  { value: "users", label: "用户管理" },
  { value: "roles", label: "角色管理" },
  { value: "export", label: "导出报表" },
];

const variants = ["opaque", "blur", "transparent"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {variants.map(variant => (
        <XhCommandRoot
          key={variant}
          variant={variant}
          collection={commands}
          placeholder="搜命令…"
          empty="没有匹配的命令"
          trigger={\`\${variant} 遮罩\`}
        />
      ))}
    </div>
  );
}
`;export{n as default};
