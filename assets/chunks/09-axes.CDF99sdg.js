const e=`// 三轴 | variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的格子一并跟着换
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/react";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[variants, tones, sizes].map((row, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {row.map(v => (
            <XhTimePickerRoot
              key={v}
              variant={i === 0 ? (v as ControlVariant) : undefined}
              tone={i === 1 ? (v as Tone) : undefined}
              size={i === 2 ? (v as Size) : undefined}
              defaultValue="09:30"
            >
              <XhTimePickerLabel>{v}</XhTimePickerLabel>
              <XhTimePickerControl>
                <XhTimePickerSegmentGroup>
                  <XhTimePickerSegment segment="hour" />
                  <span>:</span>
                  <XhTimePickerSegment segment="minute" />
                </XhTimePickerSegmentGroup>
                <XhTimePickerClearTrigger />
              </XhTimePickerControl>
              <XhTimePickerPositioner>
                <XhTimePickerContent>
                  <XhTimePickerColumn unit="hour">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                  <XhTimePickerColumn unit="minute">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                </XhTimePickerContent>
              </XhTimePickerPositioner>
            </XhTimePickerRoot>
          ))}
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
