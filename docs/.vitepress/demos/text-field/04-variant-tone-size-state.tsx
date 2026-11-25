// 形态、语气、尺寸与状态 | variant 决定底色与描边的绘制方式（描边、淡色填底、无框，没有实心档）；tone 与 variant 正交，固定 subtle 时底色差别不必聚焦即可看到；size 只改变高度、内边距与字号，标签与清空按钮一起换档；disabled 与 readOnly 都不可修改值，invalid 只标注 aria-invalid、不拦截输入
import type { CSSProperties, ReactNode } from "react";
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--xh-space-3)",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)", inlineSize: "100%" }}>
      {/* 无框档平时只看得见字，把指针移上去或聚焦才浮出边界 */}
      <div style={rowStyle}>
        {variants.map(v => (
          <XhTextFieldRoot key={v} variant={v} placeholder="请输入内容">
            <XhTextFieldLabel>{v}</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        ))}
      </div>

      {/* 正文颜色不归语气管，语气只落在底色、悬停描边与聚焦环上 */}
      <div style={rowStyle}>
        {tones.map(t => (
          <XhTextFieldRoot key={t} variant="subtle" tone={t} placeholder="点进来看聚焦环">
            <XhTextFieldLabel>{t}</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        ))}
      </div>

      {/* 固定 outline 形态，只看档位的差别 */}
      <div style={rowStyle}>
        <XhTextFieldRoot variant="outline" size="sm" defaultValue="小" clearable>
          <XhTextFieldLabel>sm</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
            <XhTextFieldClearTrigger />
          </XhTextFieldControl>
        </XhTextFieldRoot>

        <XhTextFieldRoot variant="outline" defaultValue="缺省" clearable>
          <XhTextFieldLabel>缺省</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
            <XhTextFieldClearTrigger />
          </XhTextFieldControl>
        </XhTextFieldRoot>

        <XhTextFieldRoot variant="outline" size="lg" defaultValue="大" clearable>
          <XhTextFieldLabel>lg</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
            <XhTextFieldClearTrigger />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </div>

      <div style={rowStyle}>
        <XhTextFieldRoot defaultValue="改不动" disabled>
          <XhTextFieldLabel>禁用</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>

        <XhTextFieldRoot defaultValue="只能看" readOnly>
          <XhTextFieldLabel>只读</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>

        <XhTextFieldRoot defaultValue="格式不对" invalid>
          <XhTextFieldLabel>校验失败</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      </div>
    </div>
  );
}
