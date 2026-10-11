var e=`// 程序化改值 | setValue 直接写值，只受禁用、只读与字数上限约束；clear 执行清空意图，canClear 不成立时不做任何处理
import type { ReactNode } from "react";
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldCount,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTextFieldRoot placeholder="等着被写入" maxLength={12} clearable showCount>
      {({ value, canClear, setValue, clear }) => (
        <>
          <XhTextFieldLabel>收货人</XhTextFieldLabel>
          <XhTextFieldControl>
            <XhTextFieldInput />
          </XhTextFieldControl>
          <XhTextFieldCount />
          <div style={{ display: "flex", gap: "8px" }}>
            <XhButton variant="outline" size="sm" onClick={() => setValue("曦寒")}>写入</XhButton>
            <XhButton variant="outline" size="sm" onClick={() => setValue(\`\${value}·\`)}>追加一个点</XhButton>
            <XhButton variant="outline" size="sm" disabled={!canClear} onClick={() => clear()}>清空</XhButton>
          </div>
        </>
      )}
    </XhTextFieldRoot>
  );
}
`;export{e as default};