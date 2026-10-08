var e=`// 不填充轨道 | 取值没有「多少」之分时关掉 trackFill，只留底槽与拇指，免得从一端画起的区间暗示大小
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSliderRoot defaultValue={[0]} min={-50} max={50} trackFill={false} style={{ inlineSize: "320px" }}>
      <XhSliderLabel>声道平衡</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb />
      </XhSliderControl>
    </XhSliderRoot>
  );
}
`;export{e as default};