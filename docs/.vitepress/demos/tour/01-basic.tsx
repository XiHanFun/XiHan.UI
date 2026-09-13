/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 逐步介绍页面中的关键操作
import type { ReactNode } from "react";
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

export default function Demo(): ReactNode {
  return (
    <XhTourRoot steps={steps} translations={translations}>
      {({ setOpen, lastStep }) => (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <XhButton id="tour-basic-search" variant="outline">搜索</XhButton>
            <XhButton id="tour-basic-filter" variant="outline">筛选</XhButton>
            <XhButton id="tour-basic-export" variant="outline">导出</XhButton>
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
