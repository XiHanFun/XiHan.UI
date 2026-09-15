const e=`// 红绿蓝与写法 | 推 RGB 三路走 0-255；format 决定写回的写法，这里按 rgba() 输出
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
  { channel: "red", label: "红" },
  { channel: "green", label: "绿" },
  { channel: "blue", label: "蓝" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState("rgba(59, 130, 246, 1)");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "320px" }}>
      {channels.map(item => (
        <XhColorSliderRoot
          key={item.channel}
          value={value}
          onValueChange={details => setValue(details.value)}
          channel={item.channel}
          format="rgba"
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
`;export{e as default};
