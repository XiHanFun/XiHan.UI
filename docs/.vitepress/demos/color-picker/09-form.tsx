// 随表单提交 | 值串的表单出口由作者自己挂：把当前值写进一份 input[type=hidden] 就带得走；浮层就地渲染，节点始终留在 form 里
import type { FormEvent, ReactNode } from "react";
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

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(String(data.get("brandColor") ?? ""));
  }

  return (
    <form style={{ display: "grid", gap: "12px" }} onSubmit={onSubmit}>
      <XhColorPickerRoot defaultValue="#00a98e">
        {({ value }) => (
          <>
            <XhColorPickerLabel>品牌色</XhColorPickerLabel>
            <XhColorPickerControl>
              <XhColorPickerTrigger>
                <XhColorPickerSwatch />
                <XhColorPickerValueText />
              </XhColorPickerTrigger>
            </XhColorPickerControl>
            <input type="hidden" name="brandColor" value={value} />
            <XhColorPickerPositioner>
              <XhColorPickerContent>
                <XhColorPickerSaturationArea>
                  <XhColorPickerAreaThumb />
                </XhColorPickerSaturationArea>
                <XhColorPickerChannelSlider channel="hue">
                  <XhColorPickerChannelSliderTrack />
                  <XhColorPickerChannelSliderThumb />
                </XhColorPickerChannelSlider>
              </XhColorPickerContent>
            </XhColorPickerPositioner>
          </>
        )}
      </XhColorPickerRoot>

      <div>
        <XhButton type="submit" size="sm">提交</XhButton>
      </div>

      {submitted && (
        <span>
          表单收到：
          {submitted}
        </span>
      )}
    </form>
  );
}
