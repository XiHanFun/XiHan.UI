const e=`// 拖动时的值气泡 | value-text 挂在 thumb 里就跟着走位；推动那一刻由皮肤放它出面，气泡里的文字取自作者的格式化函数
import type { CSSProperties, ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSliderValueText,
} from "@xihan-ui/react";
import { useState } from "react";

function money(value: number): string {
  return \`¥\${value.toLocaleString("zh-CN")}\`;
}

// 读屏走 aria-valuetext，与可见气泡各念各的同一个值
function valueText({ value }: { value: number }): string {
  return money(value);
}

export default function Demo(): ReactNode {
  const [budget, setBudget] = useState([1800]);

  const amount = budget[0] ?? 0;

  return (
    <>
      <XhSliderRoot
        value={budget}
        onValueChange={details => setBudget(details.value)}
        min={0}
        max={5000}
        step={50}
        getValueText={valueText}
        name="budget"
        style={{ "inlineSize": "320px", "--xh-slider-gap": "32px" } as CSSProperties}
      >
        <XhSliderLabel>{\`预算上限：\${money(amount)}\`}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderValueText />
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <p>{\`已选：\${money(amount)}\`}</p>
    </>
  );
}
`;export{e as default};
