const e=`// 只用输入框 | control 仍是必需的输入外壳；加减按钮可以省略，键盘仍按 step 与 largeStep 修改值
import type { ReactNode } from "react";
import { XhNumberFieldControl, XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhNumberFieldRoot defaultValue="60" min={0} max={100} step={5} largeStep={25}>
      {({ value }) => (
        <>
          <XhNumberFieldLabel>音量（0 – 100，每档 5）</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldInput style={{ inlineSize: "96px", textAlign: "center" }} />
          </XhNumberFieldControl>
          <span>{\`点进框里按上下键：\${value === "" ? "（空）" : value}\`}</span>
        </>
      )}
    </XhNumberFieldRoot>
  );
}
`;export{e as default};
