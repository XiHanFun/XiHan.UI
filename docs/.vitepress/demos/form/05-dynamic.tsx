// 动态字段 | 字段容器随数组增删，值表的键跟着字段名走；校验只遍历当下这几行，删掉的行不再参与
import type { ReactNode } from "react";
import {
  XhButton,
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

// 字段名的派生规则只此一处：模板、校验、提交回调都读它
function fieldName(id: number): string {
  return `tag-${id}`;
}

export default function Demo(): ReactNode {
  const nextId = useRef(1);
  const [rows, setRows] = useState([{ id: 1 }]);
  const [submitted, setSubmitted] = useState("（还没提交过）");

  function add(): void {
    nextId.current += 1;
    setRows([...rows, { id: nextId.current }]);
  }

  function remove(id: number): void {
    setRows(rows.filter(row => row.id !== id));
  }

  function validate(values: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const row of rows) {
      const name = fieldName(row.id);
      errors[name] = String(values[name] ?? "").trim() ? "" : "标签不能为空";
    }
    return errors;
  }

  function onSubmit(details: { values: Record<string, unknown> }): void {
    setSubmitted(rows
      .map(row => String(details.values[fieldName(row.id)] ?? ""))
      .join(" / "));
  }

  return (
    <XhFormRoot validate={validate} style={{ inlineSize: "320px" }} onSubmit={onSubmit}>
      {rows.map((row, index) => (
        <XhFormFieldGroup key={row.id} name={fieldName(row.id)}>
          {({ value, error, invalid, setValue }) => (
            <>
              <XhFieldRoot invalid={invalid}>
                <XhFieldLabel>{`标签 ${index + 1}`}</XhFieldLabel>
                <XhFieldControl>
                  <input
                    value={value as string}
                    onInput={event => setValue((event.target as HTMLInputElement).value)}
                  />
                </XhFieldControl>
                <XhFieldErrorText>{error}</XhFieldErrorText>
              </XhFieldRoot>
              <XhButton variant="ghost" size="sm" onClick={() => remove(row.id)}>删掉这一行</XhButton>
            </>
          )}
        </XhFormFieldGroup>
      ))}

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton variant="outline" onClick={add}>添加一行</XhButton>
        <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      </div>

      <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${submitted}`}</p>
    </XhFormRoot>
  );
}
