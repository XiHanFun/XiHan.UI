// 全选与半选 | select-all-trigger 是第三态复选框，只有把全部条目的值交给 itemValues 才分得清 checked 与 indeterminate
import type { ReactNode } from "react";
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
  { value: "truffle", label: "松露（禁用）", disabled: true },
];
const itemValues = items.map(t => t.value);

export default function Demo(): ReactNode {
  const [toppings, setToppings] = useState<string[]>(["cheese"]);

  return (
    <>
      <XhCheckboxGroupRoot
        value={toppings}
        onValueChange={details => setToppings(details.value)}
        itemValues={itemValues}
      >
        {({ checkedState }) => (
          <>
            <XhCheckboxGroupLabel>配料</XhCheckboxGroupLabel>
            {/* 方框与勾号／横杠由皮肤画，这里只写文案 */}
            <XhCheckboxGroupSelectAllTrigger>
              <span>{`全选（${checkedState}）`}</span>
            </XhCheckboxGroupSelectAllTrigger>
            {items.map(t => (
              <XhCheckboxGroupItem key={t.value} value={t.value} disabled={t.disabled}>
                <XhCheckboxGroupIndicator />
                <XhCheckboxGroupItemText>{t.label}</XhCheckboxGroupItemText>
              </XhCheckboxGroupItem>
            ))}
          </>
        )}
      </XhCheckboxGroupRoot>
      <span>{`当前：${toppings.join("、") || "（无）"}`}</span>
    </>
  );
}
