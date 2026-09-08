// 空态与面板按钮 | 受控时「没有颜色」由宿主表达：值置空，触发器换成占位方框；面板底下的两个按钮是作者自己的，收起浮层同样归宿主
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const placeholder: CSSProperties = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1.125rem",
  blockSize: "1.125rem",
  border: "1px dashed var(--xh-border-strong)",
  borderRadius: "var(--xh-radius-sm)",
  fontSize: "10px",
  color: "var(--xh-fg-muted)",
};

const actions: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};

export default function Demo(): ReactNode {
  const [color, setColor] = useState("#3b82f6");

  function clear(setOpen: (next: boolean) => void): void {
    setColor("");
    setOpen(false);
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <XhColorPickerRoot value={color} onValueChange={details => setColor(details.value)}>
        {({ setOpen }) => (
          <>
            <XhColorPickerLabel>主题色</XhColorPickerLabel>
            <XhColorPickerControl>
              <XhColorPickerTrigger>
                {color ? <XhColorPickerSwatch /> : <span style={placeholder}>∅</span>}
                <XhColorPickerValueText>{color || "未设置"}</XhColorPickerValueText>
              </XhColorPickerTrigger>
            </XhColorPickerControl>
            <XhColorPickerPositioner>
              <XhColorPickerContent>
                <XhColorPickerSaturationArea>
                  <XhColorPickerAreaThumb />
                </XhColorPickerSaturationArea>
                <XhColorPickerChannelSlider channel="hue">
                  <XhColorPickerChannelSliderTrack />
                  <XhColorPickerChannelSliderThumb />
                </XhColorPickerChannelSlider>
                <div style={actions}>
                  <XhButton size="sm" variant="ghost" onClick={() => clear(setOpen)}>
                    清空
                  </XhButton>
                  <XhButton size="sm" onClick={() => setOpen(false)}>确定</XhButton>
                </div>
              </XhColorPickerContent>
            </XhColorPickerPositioner>
          </>
        )}
      </XhColorPickerRoot>

      <span>
        当前：
        {color || "未设置"}
      </span>
    </div>
  );
}
