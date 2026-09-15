const t=`// 语气 | 卡片保持中性，tone 只改变标题与状态字形；danger 使用 assertive 实时区，loading 另有一位，转圈且不自动消失
import type { ReactNode } from "react";
import {
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";

const items = [
  { tone: "info", loading: false, title: "草稿已保存" },
  { tone: "success", loading: false, title: "发布成功" },
  { tone: "warning", loading: false, title: "配额即将用尽" },
  { tone: "danger", loading: false, title: "同步失败，稍后自动重试" },
  { tone: "info", loading: true, title: "正在上传" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      {items.map(item => (
        <XhToastRoot
          key={item.title}
          tone={item.tone}
          loading={item.loading}
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
`;export{t as default};
