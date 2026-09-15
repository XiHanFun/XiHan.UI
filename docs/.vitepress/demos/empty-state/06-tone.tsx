// 语气 | tone 为图标区上语气色，与全库同一根轴；绘制什么图标仍由作者放置
import type { ReactNode } from "react";
import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "@xihan-ui/icons";
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhIcon,
} from "@xihan-ui/react";

const results = [
  { tone: "success", glyph: CheckIcon, title: "全部导入成功", description: "128 条记录已入库。" },
  { tone: "warning", glyph: TriangleAlertIcon, title: "部分行被跳过", description: "有 6 行缺少必填字段。" },
  { tone: "danger", glyph: XIcon, title: "导入没有完成", description: "这次改动已经整体回滚。" },
  { tone: "info", glyph: InfoIcon, title: "任务已排队", description: "前面还有 3 个任务在跑。" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px" }}>
      {/* 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 */}
      {results.map(r => (
        <XhEmptyStateRoot
          key={r.tone}
          tone={r.tone}
          live="off"
          size="sm"
          style={{ inlineSize: "200px" }}
        >
          <XhEmptyStateIndicator><XhIcon icon={r.glyph} /></XhEmptyStateIndicator>
          <XhEmptyStateTitle>{r.title}</XhEmptyStateTitle>
          <XhEmptyStateDescription>{r.description}</XhEmptyStateDescription>
        </XhEmptyStateRoot>
      ))}
    </div>
  );
}
