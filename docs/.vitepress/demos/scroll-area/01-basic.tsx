/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 创建纵向滚动区域
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "构建流程", "发布记录", "迁移指南", "常见问题"];

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot type="always" style={{ blockSize: "180px", inlineSize: "min(360px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {items.map(item => <div key={item} style={{ paddingBlock: "7px" }}>{item}</div>)}
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
    </XhScrollAreaRoot>
  );
}
