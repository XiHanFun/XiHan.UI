const e=`// 限制可输入的字符 | beforeinput 直接写在 input 部件上，非法字符进不了框，值与框里的内容始终一致
import type { FormEvent, ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

// 这次要插入的文本：键入与输入法走 data，粘贴与拖入走 dataTransfer
function incoming(event: FormEvent<HTMLInputElement>): string {
  const e = event.nativeEvent as InputEvent;
  return e.data ?? e.dataTransfer?.getData("text/plain") ?? "";
}

function onlyDigits(event: FormEvent<HTMLInputElement>): void {
  const text = incoming(event);
  if (text !== "" && /\\D/.test(text)) {
    event.preventDefault();
  }
}

function noSpace(event: FormEvent<HTMLInputElement>): void {
  if (/\\s/.test(incoming(event))) {
    event.preventDefault();
  }
}

export default function Demo(): ReactNode {
  return (
    <>
      <XhTextFieldRoot placeholder="只收数字" maxLength={11}>
        <XhTextFieldLabel>手机号</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput inputMode="numeric" onBeforeInput={onlyDigits} />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot placeholder="空格进不来">
        <XhTextFieldLabel>账号</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput onBeforeInput={noSpace} />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
`;export{e as default};
