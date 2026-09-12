const r=`// 值串写法 | format 只决定对外的序列化，工作色始终是同一套；三种写法各挑一个色，改动后按各自的写法产出
import type { ReactNode } from "react";
import {
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

const cases = [
  { format: "hex", value: "#00a98e" },
  { format: "rgba", value: "rgba(59, 130, 246, 1)" },
  { format: "hsla", value: "hsla(38, 92%, 50%, 1)" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {cases.map(item => (
        <XhColorPickerRoot key={item.format} format={item.format} defaultValue={item.value}>
          <XhColorPickerLabel>{item.format}</XhColorPickerLabel>
          <XhColorPickerControl>
            <XhColorPickerTrigger>
              <XhColorPickerSwatch />
              <XhColorPickerValueText />
            </XhColorPickerTrigger>
          </XhColorPickerControl>
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
        </XhColorPickerRoot>
      ))}
    </div>
  );
}
`;export{r as default};
