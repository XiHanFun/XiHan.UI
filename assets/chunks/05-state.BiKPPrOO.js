const e=`// 禁用 / 只读 / 校验失败 | 禁用整条退出 Tab 序，只读仍能展开浏览只是改不动值，invalid 只改标注
import type { ReactNode } from "react";
import {
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

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {states.map(s => (
        <XhTimePickerRoot
          key={s.label}
          disabled={s.disabled}
          readOnly={s.readOnly}
          invalid={s.invalid}
          defaultValue="09:30"
        >
          <XhTimePickerLabel>{s.label}</XhTimePickerLabel>
          <XhTimePickerControl>
            <XhTimePickerSegmentGroup>
              <XhTimePickerSegment segment="hour" />
              <span>:</span>
              <XhTimePickerSegment segment="minute" />
            </XhTimePickerSegmentGroup>
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
  );
}
`;export{e as default};
