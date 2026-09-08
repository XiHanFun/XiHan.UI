// 受控值表 | 传了 values 就由宿主说了算：组件内部不再落值，只发变更通知；页面别处也能直接改这张表
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const defaults = { host: "127.0.0.1", port: "5173" };

export default function Demo(): ReactNode {
  const [values, setValues] = useState<Record<string, unknown>>({ ...defaults });

  return (
    <>
      <XhFormRoot
        values={values}
        onValuesChange={details => setValues(details.values)}
        defaultValues={defaults}
        style={{ inlineSize: "260px" }}
      >
        <XhFormFieldGroup value="host">
          {({ value, setValue }) => (
            <XhFieldRoot>
              <XhFieldLabel>主机</XhFieldLabel>
              <XhFieldControl>
                <input
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>

        <XhFormFieldGroup value="port">
          {({ value, setValue }) => (
            <XhFieldRoot>
              <XhFieldLabel>端口</XhFieldLabel>
              <XhFieldControl>
                <input
                  value={value as string}
                  onInput={event => setValue((event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>

        {/* 重置把值送回 defaultValues，同样经由 values-change 落到宿主这张表上 */}
        <XhFormResetTrigger>重置</XhFormResetTrigger>
      </XhFormRoot>

      <span style={{ fontSize: "13px" }}>{`宿主持有的值：${JSON.stringify(values)}`}</span>
    </>
  );
}
