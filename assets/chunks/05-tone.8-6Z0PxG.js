const n=`// 语气 | tone 决定已填轨道与滑块用哪族颜色，不写时沿用品牌色
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {tones.map(t => (
        <XhSliderRoot key={t} tone={t} defaultValue={[60]} style={{ inlineSize: "280px" }}>
          <XhSliderLabel>{t}</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>
      ))}
    </div>
  );
}
`;export{n as default};
