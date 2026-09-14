// 语气 | 卡片保持中性，type 只改变标题与状态图标；error 使用 assertive 实时区，loading 不自动消失
import type { ReactNode } from "react";
import {
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";

const items = [
  { type: "info", title: "草稿已保存" },
  { type: "success", title: "发布成功" },
  { type: "warning", title: "配额即将用尽" },
  { type: "error", title: "同步失败，稍后自动重试" },
  { type: "loading", title: "正在上传" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      {items.map(item => (
        <XhToastRoot
          key={item.type}
          type={item.type}
          title={item.title}
          duration={0}
          closable={false}
        >
          <XhToastIndicator />
          <XhToastContent><XhToastTitle /></XhToastContent>
        </XhToastRoot>
      ))}
    </div>
  );
}
