var e=`// 限定区域 | 引导只在一块区域里进行，区域外照常可读可点
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
  { id: "search", target: "#tour-boundary-search", title: "搜索", description: "遮罩只盖这块区域，区域外照常可读可点。" },
  { id: "create", target: "#tour-boundary-create", title: "新建", description: "高亮框裁在区域里。" },
];

const translations = {
  close: "关闭",
  progress: (step: number, count: number) => \`第 \${step} 步，共 \${count} 步\`,
};

export default function Demo(): ReactNode {
  return (
    <XhTourRoot steps={steps} boundary="#tour-boundary-area" translations={translations}>
      {({ setOpen, lastStep }) => (
        <>
          <div id="tour-boundary-area" style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "16px", border: "1px solid var(--xh-border-default)", borderRadius: "4px" }}>
            <XhButton id="tour-boundary-search" variant="outline">搜索</XhButton>
            <XhButton id="tour-boundary-create" variant="outline">新建</XhButton>
            <XhButton variant="solid" onClick={() => setOpen(true)}>开始引导</XhButton>
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
`;export{e as default};