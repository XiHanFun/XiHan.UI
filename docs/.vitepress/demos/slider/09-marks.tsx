// 轨道刻度 | 刻度分圆点与文案两层：圆点钉在轨道上、文案排在下方且点按跳值，落进已选区间的刻度分段上色；snapToMarks 让拖动/点按/键盘只认刻度落点
import type { SliderMark } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTickGroup,
  XhSliderTrack,
} from "@xihan-ui/react";
import { useState } from "react";

const marks: SliderMark[] = [
  { value: 0, label: "0°C" },
  { value: 26, label: "26°C" },
  { value: 37, label: "37°C" },
  { value: 100, label: "沸腾" },
];

export default function Demo(): ReactNode {
  const [free, setFree] = useState([26]);
  const [snapped, setSnapped] = useState([37]);

  return (
    <div style={{ display: "grid", gap: "40px", inlineSize: "320px" }}>
      <XhSliderRoot
        value={free}
        onValueChange={details => setFree(details.value)}
        marks={marks}
      >
        <XhSliderLabel>自由落点（点文案跳值）</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderTickGroup />
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>

      <XhSliderRoot
        value={snapped}
        onValueChange={details => setSnapped(details.value)}
        marks={marks}
        snapToMarks
      >
        <XhSliderLabel>只认刻度（拖动与方向键都吸档）</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderTickGroup />
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </div>
  );
}
