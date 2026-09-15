const r=`// 边缘渐隐 | 提示还有更多内容
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const rows = ["概览", "组件", "指南", "示例", "设计令牌", "无障碍", "主题", "动效", "国际化", "发布记录", "迁移指南", "常见问题"];

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      variant="fade"
      size="lg"
      style={{ blockSize: "180px", inlineSize: "min(320px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {rows.map(row => (
            <p key={row} style={{ margin: 0, lineHeight: "30px" }}>
              {row}
            </p>
          ))}
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
    </XhScrollAreaRoot>
  );
}
`;export{r as default};
