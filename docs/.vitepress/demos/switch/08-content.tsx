// 轨道内文案与滑块标记 | 轨道的子节点全由作者决定，data-state 同时打在轨道与滑块上
import type { ReactNode } from "react";
import { CheckIcon, XIcon } from "@xihan-ui/icons";
import { useSwitch, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  const { api: trackApi } = useSwitch({ defaultChecked: true });
  const { api: markApi } = useSwitch({});

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      {/* 文案与滑块同为轨道的直接子节点：开态文案在左、滑块在右，关态反过来 */}
      <button
        {...trackApi.getRootProps()}
        style={{
          inlineSize: "auto",
          minInlineSize: "64px",
          justifyContent: "space-between",
          gap: "6px",
          paddingInline: "8px",
        }}
      >
        {trackApi.checked
          ? <span style={{ fontSize: "12px", color: "var(--xh-fg-on-brand)" }}>开</span>
          : null}
        <span {...trackApi.getThumbProps()} style={{ translate: "none" }} />
        {trackApi.checked ? null : <span style={{ fontSize: "12px" }}>关</span>}
      </button>

      {/* 滑块里也能放东西：属性来自 getThumbProps，内容照写不误 */}
      <button {...markApi.getRootProps()}>
        <span
          {...markApi.getThumbProps()}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}
        >
          <XhIcon icon={markApi.checked ? CheckIcon : XIcon} />
        </span>
      </button>
    </div>
  );
}
