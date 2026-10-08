var e=`// 选择型条目 | CheckboxItem 与 RadioGroup 修改持久设置，切换后菜单保持展开
import type { ReactNode } from "react";
import {
  XhMenuCheckboxItem,
  XhMenuContent,
  XhMenuItemIndicator,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRadioGroup,
  XhMenuRadioItem,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [checkboxValue, setCheckboxValue] = useState(["wrap"]);
  const [radioValue, setRadioValue] = useState<Record<string, string>>({ density: "comfortable" });
  return (
    <XhMenuRoot
      checkboxValue={checkboxValue}
      radioValue={radioValue}
      onCheckboxValueChange={({ value }) => setCheckboxValue(value)}
      onRadioValueChange={({ value }) => setRadioValue(value)}
    >
      <XhMenuTrigger>视图设置</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuCheckboxItem value="wrap">
            <XhMenuItemIndicator />
            <XhMenuItemText>自动换行</XhMenuItemText>
          </XhMenuCheckboxItem>
          <XhMenuRadioGroup value="density">
            <XhMenuRadioItem value="comfortable">
              <XhMenuItemIndicator />
              <XhMenuItemText>宽松</XhMenuItemText>
            </XhMenuRadioItem>
            <XhMenuRadioItem value="compact">
              <XhMenuItemIndicator />
              <XhMenuItemText>紧凑</XhMenuItemText>
            </XhMenuRadioItem>
          </XhMenuRadioGroup>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  );
}
`;export{e as default};