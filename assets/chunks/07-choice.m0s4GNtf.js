var e=`// 选择型条目 | CheckboxItem 与 RadioGroup 修改持久设置，切换后菜单保持展开
import type { ReactNode } from "react";
import {
  XhButton,
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
      <XhMenuTrigger asChild>
        <XhButton variant="subtle">视图设置</XhButton>
      </XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuCheckboxItem value="wrap">
            <XhMenuItemText>自动换行</XhMenuItemText>
            <XhMenuItemIndicator />
          </XhMenuCheckboxItem>
          <XhMenuRadioGroup value="density">
            <XhMenuRadioItem value="comfortable">
              <XhMenuItemText>宽松</XhMenuItemText>
              <XhMenuItemIndicator />
            </XhMenuRadioItem>
            <XhMenuRadioItem value="compact">
              <XhMenuItemText>紧凑</XhMenuItemText>
              <XhMenuItemIndicator />
            </XhMenuRadioItem>
          </XhMenuRadioGroup>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  );
}
`;export{e as default};