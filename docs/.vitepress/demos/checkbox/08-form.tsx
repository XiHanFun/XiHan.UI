// 随表单提交 | 给了 name 才生出表单影子：勾上才提交，半选按未勾处理，与原生复选框一致
import type { FormEvent, ReactNode } from "react";
import { XhButton, XhCheckbox } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const keys = [...data.entries()].map(([k, v]) => `${k}=${v}`);
    setSubmitted(keys.length ? keys.join("  ") : "（一个字段都没提交）");
  }

  return (
    <form style={{ display: "grid", gap: "12px" }} onSubmit={onSubmit}>
      <label>
        <XhCheckbox name="agree" defaultChecked />
        已阅读条款（勾上才提交）
      </label>
      <label>
        <XhCheckbox name="news" />
        订阅周报（没勾就整条不进 FormData）
      </label>
      <label>
        <XhCheckbox name="partial" defaultChecked="indeterminate" />
        半选（按未勾处理，不提交）
      </label>
      {/* 不给 name 就没有影子节点，既有 DOM 一个字节不变 */}
      <label>
        <XhCheckbox />
        不参与提交
      </label>

      <div>
        <XhButton type="submit" size="sm">提交</XhButton>
      </div>

      {submitted
        ? (
            <span>
              表单收到：
              {submitted}
            </span>
          )
        : null}
    </form>
  );
}
