const n=`// 分隔符 | 在相邻内容之间添加分隔符
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const ruleStyle = {
  display: "block",
  inlineSize: "1px",
  blockSize: "1em",
  background: "var(--xh-border-default)",
};

const actions = ["编辑", "复制", "归档", "删除"];
const tones = ["brand", "info", "success", "danger"] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex gap="sm" split={<span style={ruleStyle} />}>
      {actions.map((action, index) => (
        <span key={action} data-demo-block="line" data-tone={tones[index]} aria-label={action} style={{ "--xh-demo-block-inline-size": "48px" } as CSSProperties} />
      ))}
    </XhFlex>
  );
}
`;export{n as default};
