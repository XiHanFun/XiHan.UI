// 离散档位 | 可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上
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
import { useState } from "react";

const levels = [1, 5, 10, 50, 100, 500];

function valueText({ value }: { value: number }): string {
  return `每页 ${levels[value]} 条`;
}

export default function Demo(): ReactNode {
  const [index, setIndex] = useState([2]);

  const current = levels[index[0] ?? 0];

  return (
    <div style={{ inlineSize: "320px", display: "grid", gap: "12px" }}>
      <XhSliderRoot
        value={index}
        onValueChange={details => setIndex(details.value)}
        min={0}
        max={levels.length - 1}
        step={1}
        largeStep={1}
        getValueText={valueText}
      >
        <XhSliderLabel>{`每页 ${current} 条`}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>

      <span style={{ fontSize: "12px", color: "var(--xh-fg-muted)" }}>
        {`可选：${levels.join(" / ")}`}
      </span>
    </div>
  );
}
