// 受控 | 传了 open 与 value 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态
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
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from "@xihan-ui/react";
import { useState } from "react";

const steps = [
  {
    id: "list",
    target: "#tour-controlled-list",
    title: "列表",
    description: "记录都在这里。",
  },
  {
    id: "detail",
    target: "#tour-controlled-detail",
    title: "详情",
    description: "选中一条后在这块看明细。",
  },
  {
    id: "actions",
    target: "#tour-controlled-actions",
    title: "操作",
    description: "批量动作收在这一栏。",
  },
];

const panel: CSSProperties = {
  padding: "8px 14px",
  border: "1px solid var(--vp-c-divider)",
  borderRadius: "8px",
};

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState("（未开始）");

  function start(from: number): void {
    setStep(from);
    setOpen(true);
  }

  function onComplete(details: { step: number }): void {
    setLog(`走完了第 ${details.step + 1} 步`);
  }

  function onSkip(details: { step: number }): void {
    setLog(`在第 ${details.step + 1} 步放弃`);
  }

  return (
    <XhTourRoot
      open={open}
      onOpenChange={details => setOpen(details.open)}
      value={step}
      onValueChange={details => setStep(details.value)}
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
    >
      <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div id="tour-controlled-list" style={panel}>列表</div>
          <div id="tour-controlled-detail" style={panel}>详情</div>
          <div id="tour-controlled-actions" style={panel}>操作</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          <XhButton variant="solid" onClick={() => start(0)}>从头开始</XhButton>
          <XhButton variant="outline" onClick={() => start(2)}>直接跳到第 3 步</XhButton>
          <span style={{ fontSize: "13px", opacity: 0.75 }}>
            {`open=${open} · value=${step} · ${log}`}
          </span>
        </div>
      </div>

      <XhTourBackdrop />
      <XhTourSpotlight />
      <XhTourPositioner>
        <XhTourContent>
          <XhTourTitle />
          <XhTourDescription />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
            <XhTourNextTrigger>下一步</XhTourNextTrigger>
          </div>
          <XhTourCloseTrigger />
          <XhTourArrow />
        </XhTourContent>
      </XhTourPositioner>
    </XhTourRoot>
  );
}
