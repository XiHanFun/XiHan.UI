/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定位 | 为每一步选择合适的浮层方向
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
  XhTourProgressText,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/react";

const steps = [
  { id: "left", target: "#tour-placement-left", title: "左侧入口", description: "浮层显示在目标下方。", placement: "bottom-start" as const },
  { id: "center", target: "#tour-placement-center", title: "中间入口", description: "浮层显示在目标上方。", placement: "top" as const },
  { id: "right", target: "#tour-placement-right", title: "右侧入口", description: "浮层显示在目标左侧。", placement: "left" as const },
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
            <XhButton id="tour-placement-left" variant="outline">左侧</XhButton>
            <XhButton id="tour-placement-center" variant="outline">中间</XhButton>
            <XhButton id="tour-placement-right" variant="outline">右侧</XhButton>
            <XhButton variant="solid" onClick={() => setOpen(true)}>查看定位</XhButton>
          </div>

          <XhTourBackdrop />
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
