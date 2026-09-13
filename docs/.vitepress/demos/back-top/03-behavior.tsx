/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滚动方式 | 平滑返回或立即返回
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useRef } from "react";

const sections = ["概览", "配置", "接口", "发布"];
const panelStyle: CSSProperties = {
  blockSize: "200px",
  overflow: "auto",
  paddingInline: "14px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};
const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "10px",
  "--xh-back-top-inset-inline": "10px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const smoothEl = useRef<HTMLDivElement>(null);
  const autoEl = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", inlineSize: "min(640px, 100%)" }}>
      <div style={{ position: "relative" }}>
        <div ref={smoothEl} style={panelStyle}>
          {sections.map(section => <p key={section} style={{ minBlockSize: "64px" }}>{`平滑 · ${section}`}</p>)}
        </div>
        <XhBackTopRoot target={() => smoothEl.current} behavior="smooth" visibilityHeight={40} size="sm" style={rootStyle}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>

      <div style={{ position: "relative" }}>
        <div ref={autoEl} style={panelStyle}>
          {sections.map(section => <p key={section} style={{ minBlockSize: "64px" }}>{`立即 · ${section}`}</p>)}
        </div>
        <XhBackTopRoot target={() => autoEl.current} behavior="auto" visibilityHeight={40} size="sm" style={rootStyle}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>
    </div>
  );
}
