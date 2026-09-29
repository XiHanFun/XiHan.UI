const n=`// 提交在途 | 提交回调返回 Promise：落定之前 submitting 为真，提交钮报在途、再按也不会重复提交；拒绝经 submit-error 报出
import type { FormSubmitDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [saved, setSaved] = useState("");

  // 保存请求在后端，这里用定时器代替
  function save({ values }: FormSubmitDetails): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        setSaved(String(values.nickname ?? ""));
        resolve();
      }, 1500);
    });
  }

  return (
    <XhFormRoot
      defaultValues={{ nickname: "小明" }}
      onSubmit={save}
      style={{ inlineSize: "320px", display: "grid", gap: "12px" }}
    >
      {({ submitting }) => (
        <>
          <XhFormFieldGroup name="nickname">
            {({ value, setValue }) => (
              <XhFieldRoot>
                <XhFieldLabel>昵称</XhFieldLabel>
                <XhFieldControl>
                  <input
                    value={value as string}
                    onInput={event => setValue((event.target as HTMLInputElement).value)}
                  />
                </XhFieldControl>
              </XhFieldRoot>
            )}
          </XhFormFieldGroup>

          <XhFormSubmitTrigger>{submitting ? "保存中…" : "保存"}</XhFormSubmitTrigger>
          <p>{saved ? \`已保存：\${saved}\` : "尚未保存"}</p>
        </>
      )}
    </XhFormRoot>
  );
}
`;export{n as default};
