const e=`// 禁用与校验态 | disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhTextFieldRoot defaultValue="改不动" disabled>
        <XhTextFieldLabel>禁用</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "160px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot defaultValue="只能看" readOnly>
        <XhTextFieldLabel>只读</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "160px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot defaultValue="格式不对" invalid>
        <XhTextFieldLabel>校验失败</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "160px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
`;export{e as default};
