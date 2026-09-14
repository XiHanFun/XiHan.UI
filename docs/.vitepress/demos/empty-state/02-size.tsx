// 尺寸 | size 只换留白与字号，语义一点不动；不传即 md
import type { ReactNode } from "react";
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhEmptyStateRoot size="sm" style={{ inlineSize: "220px" }}>
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>sm</XhEmptyStateTitle>
        <XhEmptyStateDescription>塞进侧栏或卡片里的那一档。</XhEmptyStateDescription>
      </XhEmptyStateRoot>

      <XhEmptyStateRoot style={{ inlineSize: "220px" }}>
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>md</XhEmptyStateTitle>
        <XhEmptyStateDescription>缺省档，列表与表格用它。</XhEmptyStateDescription>
      </XhEmptyStateRoot>

      <XhEmptyStateRoot size="lg" style={{ inlineSize: "220px" }}>
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>lg</XhEmptyStateTitle>
        <XhEmptyStateDescription>整页只有这一块时用它。</XhEmptyStateDescription>
      </XhEmptyStateRoot>
    </>
  );
}
