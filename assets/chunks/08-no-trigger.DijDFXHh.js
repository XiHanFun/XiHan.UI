const e=`// 只用输入框 | 加减钮是可选部件，不渲染它照样能改值：方向键走 step，PageUp 与 PageDown 走 largeStep
import type { ReactNode } from "react";
import { XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhNumberFieldRoot defaultValue="60" min={0} max={100} step={5} largeStep={25}>
      {({ value }) => (
        <>
          <XhNumberFieldLabel>音量（0 – 100，每档 5）</XhNumberFieldLabel>
          <XhNumberFieldInput style={{ inlineSize: "96px", textAlign: "center" }} />
          <span>{\`点进框里按上下键：\${value === "" ? "（空）" : value}\`}</span>
        </>
      )}
    </XhNumberFieldRoot>
  );
}
`;export{e as default};
