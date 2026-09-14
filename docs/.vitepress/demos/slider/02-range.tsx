// 区间选择 | 两个拇指互为对方的边界、永不交叉，minStepsBetweenThumbs 再给它们之间留出格数；getValueText 把值翻成读屏念得出的话
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

function valueText({ value, index }: { value: number; index: number }): string {
  return `${index === 0 ? "起价" : "止价"} ${value} 元`;
}

export default function Demo(): ReactNode {
  const [price, setPrice] = useState([200, 600]);

  return (
    <XhSliderRoot
      value={price}
      onValueChange={details => setPrice(details.value)}
      min={0}
      max={1000}
      step={10}
      minStepsBetweenThumbs={2}
      getValueText={valueText}
      name="price"
      style={{ inlineSize: "320px" }}
    >
      <XhSliderLabel>{`价格：¥${price[0]} – ¥${price[1]}`}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb index={0}>
          <XhSliderHiddenInput />
        </XhSliderThumb>
        <XhSliderThumb index={1}>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  );
}
