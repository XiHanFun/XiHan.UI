var e=`// 整卡可点 | interactive 加标题里的 trigger：整张卡片都是点击区，读屏只读到一个链接
import type { ReactNode } from "react";
import {
  XhButton,
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
  XhCardTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 链接只包标题文字：可及名就是「季度报告」，卡片里的其余内容不进链接名
    <XhCardRoot interactive style={{ inlineSize: 360, maxInlineSize: "100%" }}>
      <XhCardHeader>
        <XhCardTitle>
          <XhCardTrigger href="#/reports/2026-q3">季度报告</XhCardTrigger>
        </XhCardTitle>
        <XhCardDescription>2026 年第三季度 · 财务部</XhCardDescription>
      </XhCardHeader>
      <XhCardContent>营收同比增长 12%，毛利率持平。</XhCardContent>
      {/* 脚部叠在点击区之上：里面的按钮照常可点，不触发整卡 */}
      <XhCardFooter>
        <XhButton size="sm" variant="ghost">收藏</XhButton>
      </XhCardFooter>
    </XhCardRoot>
  );
}
`;export{e as default};