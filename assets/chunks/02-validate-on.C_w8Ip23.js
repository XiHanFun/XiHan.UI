const n=`// 校验时机 | 在失焦或输入时校验
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";

function validate(values: Record<string, unknown>): Record<string, string> {
  const port = String(values.port ?? "").trim();
  return { port: /^\\d+$/.test(port) ? "" : "端口只能是数字" };
}

export default function Demo(): ReactNode {
  return (
    <>
      {/* 失焦时校验这一个字段：填的过程中不打断 */}
      <XhFormRoot
        defaultValues={{ port: "abc" }}
        validate={validate}
        validateOn="blur"
        style={{ inlineSize: "240px" }}
      >
        <XhFormFieldGroup name="port">
          {({ value, error, invalid, setValue }) => (
            <XhFieldRoot invalid={invalid}>
              <XhFieldLabel>端口（失焦校验）</XhFieldLabel>
              <XhFieldControl>
                <input
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldErrorText>{error}</XhFieldErrorText>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>
        <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      </XhFormRoot>

      {/* 改一个字就校验一次：错误随输入实时消长 */}
      <XhFormRoot
        defaultValues={{ port: "abc" }}
        validate={validate}
        validateOn="change"
        style={{ inlineSize: "240px" }}
      >
        <XhFormFieldGroup name="port">
          {({ value, error, invalid, setValue }) => (
            <XhFieldRoot invalid={invalid}>
              <XhFieldLabel>端口（改动即校验）</XhFieldLabel>
              <XhFieldControl>
                <input
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldErrorText>{error}</XhFieldErrorText>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>
        <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      </XhFormRoot>
    </>
  );
}
`;export{n as default};
