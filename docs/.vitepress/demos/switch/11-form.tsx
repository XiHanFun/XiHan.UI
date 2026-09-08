// 随表单提交 | 给了 name 才生出表单影子：开着才提交，值缺省是 on，与原生复选框一致
import type { FormEvent, ReactNode } from "react";
import { XhButton, XhSwitch } from "@xihan-ui/react";
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
        <XhSwitch name="notify" defaultChecked />
        {" 接收通知（开着，提交 notify=on）"}
      </label>
      <label>
        <XhSwitch name="beta" />
        {" 加入内测（没开就整条不进 FormData）"}
      </label>
      {/* value 换掉默认的 on */}
      <label>
        <XhSwitch name="theme" value="dark" defaultChecked />
        {" 深色主题（提交 theme=dark）"}
      </label>

      <div>
        <XhButton type="submit" size="sm">提交</XhButton>
      </div>

      {submitted ? <span>{`表单收到：${submitted}`}</span> : null}
    </form>
  );
}
