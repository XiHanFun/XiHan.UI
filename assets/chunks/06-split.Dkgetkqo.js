const n=`// 分隔符 | 每两个子项之间放一份分隔符：Vue 交给 split 插槽自动铺，WC 由作者逐个写在 root 里
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const linkStyle = { color: "var(--xh-fg-brand)", cursor: "pointer" };
// 分隔符部件自带 aria-hidden，这里只画那条线；display: block 让它吃得住尺寸
const ruleStyle = {
  display: "block",
  inlineSize: "1px",
  blockSize: "1em",
  background: "var(--xh-border-default)",
};

const actions = ["编辑", "复制", "归档", "删除"];

export default function Demo(): ReactNode {
  return (
    <XhFlex gap="sm" split={<span style={ruleStyle} />}>
      {actions.map(a => <span key={a} style={linkStyle}>{a}</span>)}
    </XhFlex>
  );
}
`;export{n as default};
