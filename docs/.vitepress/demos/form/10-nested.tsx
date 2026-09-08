// 嵌套模型与路径字段名 | 字段名直接写成路径，值仍住在宿主自己的嵌套对象里：表单只管错误、id 与摘要跳转，提交时不用把扁平表折回去
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormRoot,
  XhFormSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

// 路径名的派生规则只此一处：模板、校验、摘要都读它
function hobbyName(index: number): string {
  return `hobbies[${index}].hobby`;
}

export default function Demo(): ReactNode {
  const [model, setModel] = useState({
    user: { name: "", email: "" },
    hobbies: [{ hobby: "" }, { hobby: "" }],
  });
  const [submitted, setSubmitted] = useState("（还没提交过）");

  function setUser(key: "name" | "email", next: string): void {
    setModel({ ...model, user: { ...model.user, [key]: next } });
  }

  function setHobby(index: number, next: string): void {
    setModel({
      ...model,
      hobbies: model.hobbies.map((row, i) => (i === index ? { hobby: next } : row)),
    });
  }

  // 校验不看入参，直接读宿主的嵌套模型；返回的键就是那几条路径
  function validate(): Record<string, string> {
    const errors: Record<string, string> = {
      "user.name": model.user.name.trim() ? "" : "姓名不能为空",
      "user.email": model.user.email.includes("@") ? "" : "邮箱要带一个 @",
    };
    model.hobbies.forEach((row, index) => {
      errors[hobbyName(index)] = row.hobby.trim() ? "" : "爱好不能为空";
    });
    return errors;
  }

  function onSubmit(): void {
    setSubmitted(JSON.stringify(model));
  }

  return (
    <XhFormRoot validate={validate} style={{ inlineSize: "320px" }} onSubmit={onSubmit}>
      {/* 摘要条目按路径名指过去，点一下焦点落进对应的字段容器 */}
      <XhFormErrorSummary>
        {({ errorCount }) => (
          <>
            <span>{`共 ${errorCount} 处需要修改`}</span>
            <XhFormErrorSummaryItem value="user.name">{({ error }) => `姓名：${error ?? ""}`}</XhFormErrorSummaryItem>
            <XhFormErrorSummaryItem value="user.email">{({ error }) => `邮箱：${error ?? ""}`}</XhFormErrorSummaryItem>
            {model.hobbies.map((_, index) => (
              <XhFormErrorSummaryItem key={index} value={hobbyName(index)}>
                {({ error }) => `爱好 ${index + 1}：${error ?? ""}`}
              </XhFormErrorSummaryItem>
            ))}
          </>
        )}
      </XhFormErrorSummary>

      <XhFormFieldGroup value="user.name">
        {({ error, invalid }) => (
          <XhFieldRoot invalid={invalid} required>
            <XhFieldLabel>姓名</XhFieldLabel>
            <XhFieldControl>
              {/* 控件直接绑在嵌套模型上，值不经过表单的值表 */}
              <input
                value={model.user.name}
                onInput={event => setUser("name", (event.target as HTMLInputElement).value)}
              />
            </XhFieldControl>
            <XhFieldErrorText>{error}</XhFieldErrorText>
          </XhFieldRoot>
        )}
      </XhFormFieldGroup>

      <XhFormFieldGroup value="user.email">
        {({ error, invalid }) => (
          <XhFieldRoot invalid={invalid} required>
            <XhFieldLabel>邮箱</XhFieldLabel>
            <XhFieldControl>
              <input
                value={model.user.email}
                type="email"
                onInput={event => setUser("email", (event.target as HTMLInputElement).value)}
              />
            </XhFieldControl>
            <XhFieldErrorText>{error}</XhFieldErrorText>
          </XhFieldRoot>
        )}
      </XhFormFieldGroup>

      {model.hobbies.map((row, index) => (
        <XhFormFieldGroup key={index} value={hobbyName(index)}>
          {({ error, invalid }) => (
            <XhFieldRoot invalid={invalid} required>
              <XhFieldLabel>{`爱好 ${index + 1}`}</XhFieldLabel>
              <XhFieldControl>
                <input
                  value={row.hobby}
                  onInput={event => setHobby(index, (event.target as HTMLInputElement).value)}
                />
              </XhFieldControl>
              <XhFieldErrorText>{error}</XhFieldErrorText>
            </XhFieldRoot>
          )}
        </XhFormFieldGroup>
      ))}

      <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
      <p style={{ margin: 0, fontSize: "13px" }}>{`已提交：${submitted}`}</p>
    </XhFormRoot>
  );
}
