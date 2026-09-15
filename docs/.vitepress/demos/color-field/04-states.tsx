// 状态与尺寸 | 禁用、只读、无效三态与 sm / lg 两档；色块与清空按钮跟随字段的尺寸档
import type { ReactNode } from "react";
import {
  XhColorFieldClearTrigger,
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      <XhColorFieldRoot defaultValue="#10b981" disabled>
        <XhColorFieldLabel>禁用</XhColorFieldLabel>
        <XhColorFieldControl style={{ inlineSize: "14rem" }}>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
      </XhColorFieldRoot>
      <XhColorFieldRoot defaultValue="#10b981" readOnly>
        <XhColorFieldLabel>只读</XhColorFieldLabel>
        <XhColorFieldControl style={{ inlineSize: "14rem" }}>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
      </XhColorFieldRoot>
      <XhColorFieldRoot defaultValue="#10b981" invalid clearable>
        <XhColorFieldLabel>无效</XhColorFieldLabel>
        <XhColorFieldControl style={{ inlineSize: "14rem" }}>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
      </XhColorFieldRoot>
      <XhColorFieldRoot defaultValue="#10b981" size="sm" clearable>
        <XhColorFieldLabel>小号</XhColorFieldLabel>
        <XhColorFieldControl style={{ inlineSize: "14rem" }}>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
      </XhColorFieldRoot>
      <XhColorFieldRoot defaultValue="#10b981" size="lg" clearable>
        <XhColorFieldLabel>大号</XhColorFieldLabel>
        <XhColorFieldControl style={{ inlineSize: "14rem" }}>
          <XhColorFieldSwatch />
          <XhColorFieldInput />
          <XhColorFieldClearTrigger />
        </XhColorFieldControl>
      </XhColorFieldRoot>
    </div>
  );
}
