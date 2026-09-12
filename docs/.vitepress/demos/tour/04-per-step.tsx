// 无遮罩 | 保留页面环境并突出目标
import type { ReactNode } from "react";
import {
  XhButton,
  XhTourArrow,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/react";

const steps = [
  { id: "search", target: "#tour-clear-search", title: "搜索", description: "输入关键词查找记录。" },
  { id: "filter", target: "#tour-clear-filter", title: "筛选", description: "按状态收窄结果。" },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};

export default function Demo(): ReactNode {
  return (
    <XhTourRoot steps={steps} showBackdrop={false} translations={translations}>
      {({ setOpen, lastStep }) => (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <XhButton id="tour-clear-search" variant="outline">搜索</XhButton>
            <XhButton id="tour-clear-filter" variant="outline">筛选</XhButton>
            <XhButton variant="solid" onClick={() => setOpen(true)}>开始引导</XhButton>
          </div>

          <XhTourSpotlight />
          <XhTourPositioner>
            <XhTourContent>
              <XhTourTitle />
              <XhTourDescription />
              <XhTourProgressText />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
                <XhTourNextTrigger>{lastStep ? "完成" : "下一步"}</XhTourNextTrigger>
              </div>
              <XhTourCloseTrigger />
              <XhTourArrow />
            </XhTourContent>
          </XhTourPositioner>
        </>
      )}
    </XhTourRoot>
  );
}
