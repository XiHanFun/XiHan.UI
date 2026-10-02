const e=`// 多选成标签 | selectionMode="multiple" 时各列拼出的是草稿，按「添加」收进值、浮层不收，可以接着添；选中的时刻在输入行里排成标签，点叉或在展开钮上按退格摘掉
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerConfirmTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTagList,
  XhTimePickerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["09:00", "14:30"]);

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        name="reminders"
        selectionMode="multiple"
        timeStep={{ minute: 15 }}
      >
        <XhTimePickerLabel>提醒时刻</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerTagList />
          <XhTimePickerClearTrigger />
          <XhTimePickerTrigger />
        </XhTimePickerControl>
        <XhTimePickerHiddenInput />
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerConfirmTrigger>添加</XhTimePickerConfirmTrigger>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>
        {\`当前值：\${value.join("、") || "（空）"}\`}
      </span>
    </>
  );
}
`;export{e as default};
