// 图标标签 | 图标辅助识别内容类别
import type { ReactNode } from "react";
import { ActivityIcon, ChartBarIcon, FileTextIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="activity" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="项目数据">
        <XhTabsTrigger value="activity">
          <XhIcon icon={ActivityIcon} />
          活动
        </XhTabsTrigger>
        <XhTabsTrigger value="analytics">
          <XhIcon icon={ChartBarIcon} />
          分析
        </XhTabsTrigger>
        <XhTabsTrigger value="reports">
          <XhIcon icon={FileTextIcon} />
          报告
        </XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="activity">查看项目近期活动。</XhTabsContent>
      <XhTabsContent value="analytics">查看项目分析数据。</XhTabsContent>
      <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
    </XhTabsRoot>
  );
}
