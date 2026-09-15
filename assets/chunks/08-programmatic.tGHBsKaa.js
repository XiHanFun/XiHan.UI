const e=`// 程序化改值 | setValue 直接写值，只受禁用、只读与字数上限约束；clear 走清空意图，canClear 不成立时按兵不动
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTextFieldRoot placeholder="等着被写入" maxLength={12} clearable>
      {({ value, empty, canClear, setValue, clear }) => (
        <>
          <XhTextFieldLabel>收货人</XhTextFieldLabel>
          <XhTextFieldControl style={{ inlineSize: "200px" }}>
            <XhTextFieldInput />
          </XhTextFieldControl>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => setValue("曦寒")}>写入</button>
            <button type="button" onClick={() => setValue(\`\${value}·\`)}>追加一个点</button>
            <button type="button" disabled={!canClear} onClick={() => clear()}>清空</button>
          </div>
          <span>{empty ? "（空）" : \`\${value.length} / 12\`}</span>
        </>
      )}
    </XhTextFieldRoot>
  );
}
`;export{e as default};
