const n=`// 多行水印 | 显示归属和时间信息
import type { ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

const lines = ["曦寒前端组件库", "zhaifanhua@gmail.com", "2026-08-11"];

export default function Demo(): ReactNode {
  return (
    <XhWatermarkRoot text={lines} fontSize={13}>
      <XhWatermarkContent>
        <div style={{ inlineSize: "320px", padding: "32px", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <strong>设计稿预览</strong>
          <p style={{ marginBlockEnd: 0 }}>该内容仅供项目成员评审。</p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  );
}
`;export{n as default};
