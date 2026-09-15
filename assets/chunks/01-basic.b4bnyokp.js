const e=`// 基础用法 | 一条滑杆只推颜色的一路，默认是色相：值是整个颜色串，轨道画的是这一路从头走到尾的颜色
import type { ReactNode } from "react";
import {
  XhColorSliderControl,
  XhColorSliderHiddenInput,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSwatch,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("#3b82f6");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "320px" }}>
      <XhColorSliderRoot value={value} onValueChange={details => setValue(details.value)} name="accent">
        <XhColorSliderLabel>色相</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb>
            <XhColorSliderHiddenInput />
          </XhColorSliderThumb>
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        <XhColorSwatch value={value} />
        <code>{value}</code>
      </span>
    </div>
  );
}
`;export{e as default};
