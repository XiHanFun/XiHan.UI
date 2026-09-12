const e=`// 标题档位 | level 只换字号档位，用哪个标签由作者定；不传 level 即默认档
import type { ReactNode } from "react";
import { XhTypographyHeading, XhTypographyRoot } from "@xihan-ui/react";

// as const 让每一项是字面量类型，才对得上 level 收的 1-6 联合
const levels = [1, 2, 3, 4, 5, 6] as const;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      {levels.map(l => (
        <XhTypographyHeading key={l} level={l}>
          {\`第 \${l} 档标题\`}
        </XhTypographyHeading>
      ))}
    </XhTypographyRoot>
  );
}
`;export{e as default};
