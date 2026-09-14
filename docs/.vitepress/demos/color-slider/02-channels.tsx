// 通道并排 | 几条共用同一个值、各推自己那一路；开 alpha 让推色相时透明度不丢，就拼出一个 HSV 调色面板
import type { ColorChannel } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSliderValueText,
  XhColorSwatch,
} from "@xihan-ui/react";
import { useState } from "react";

const channels: { channel: ColorChannel; label: string }[] = [
  { channel: "hue", label: "色相" },
  { channel: "saturation", label: "饱和度" },
  { channel: "brightness", label: "明度" },
  { channel: "alpha", label: "透明度" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState("#3b82f680");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "320px" }}>
      {/* 四条共用一个值；alpha 显式开着，推色相 / 饱和度 / 明度时透明度那一位才留得住 */}
      {channels.map(item => (
        <XhColorSliderRoot
          key={item.channel}
          value={value}
          onValueChange={details => setValue(details.value)}
          channel={item.channel}
          alpha
          size="sm"
        >
          <XhColorSliderLabel>{item.label}</XhColorSliderLabel>
          <XhColorSliderControl>
            <XhColorSliderTrack />
            <XhColorSliderThumb>
              <XhColorSliderValueText />
            </XhColorSliderThumb>
          </XhColorSliderControl>
        </XhColorSliderRoot>
      ))}
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        <XhColorSwatch value={value} size="lg" />
        <code>{value}</code>
      </span>
    </div>
  );
}
