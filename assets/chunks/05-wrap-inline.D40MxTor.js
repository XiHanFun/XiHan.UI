const n=`// 换行与行内 | 换行排列或随文字排布
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const tags = ["前端", "组件库", "无障碍", "设计令牌", "键盘导航"];
const tagStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: "var(--xh-shape-pill)",
  background: "var(--xh-bg-brand-subtle)",
  color: "var(--xh-fg-brand)",
  fontSize: "13px",
};

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      <XhFlex wrap gap="sm" style={{ maxInlineSize: "280px" }}>
        {tags.map(tag => <span key={tag} style={tagStyle}>{tag}</span>)}
      </XhFlex>
      <div>
        当前筛选：
        <XhFlex inline gap="xs">
          <span style={tagStyle}>近 7 天</span>
          <span style={tagStyle}>已完成</span>
        </XhFlex>
      </div>
    </XhFlex>
  );
}
`;export{n as default};
