// 基础用法 | steps 是唯一事实源，组件只按下标取用；每步的 target 是一个 CSS 选择器，高亮框与浮层都锚在它上面
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressIndicator,
  XhTourProgressText,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/react";

const steps = [
  {
    id: "search",
    target: "#tour-basic-search",
    title: "全站搜索",
    description: "按名称或编号找记录，支持拼音首字母。",
    placement: "bottom" as const,
  },
  {
    id: "filter",
    target: "#tour-basic-filter",
    title: "筛选",
    description: "按状态与时间区间收窄结果，条件会记在本地。",
    placement: "bottom" as const,
  },
  {
    id: "export",
    target: "#tour-basic-export",
    title: "导出",
    description: "导出当前筛选后的全部数据，走后台队列。",
    placement: "bottom-end" as const,
  },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => `第 ${step} 步，共 ${count} 步`,
};

const panel: CSSProperties = {
  padding: "8px 14px",
  border: "1px solid var(--vp-c-divider)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  return (
    <XhTourRoot steps={steps} translations={translations}>
      {({ setOpen, lastStep }) => (
        <>
          <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <div id="tour-basic-search" style={panel}>搜索</div>
              <div id="tour-basic-filter" style={panel}>筛选</div>
              <div id="tour-basic-export" style={panel}>导出</div>
            </div>
            <XhButton variant="solid" onClick={() => setOpen(true)}>开始引导</XhButton>
          </div>

          <XhTourBackdrop />
          <XhTourSpotlight />
          <XhTourPositioner>
            <XhTourContent>
              <XhTourTitle />
              <XhTourDescription />
              <XhTourProgressText />
              <XhTourProgressIndicator />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
                <XhTourNextTrigger>
                  {lastStep ? "完成" : "下一步"}
                </XhTourNextTrigger>
                <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
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
