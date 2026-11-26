// 格式化显示 | formatOptions 交给 Intl.NumberFormat：失焦时显示格式化文字，聚焦编辑时换回原值；值与表单提交始终是原值
import type { FormEvent, ReactNode } from "react";
import { XhButton, XhNumberFieldRoot } from "@xihan-ui/react";
import { useState } from "react";

// 选项原样交给 Intl.NumberFormat，语言取 locale；没写 locale 时取全局配置
const currency: Intl.NumberFormatOptions = { style: "currency", currency: "CNY" };

export default function Demo(): ReactNode {
  const [price, setPrice] = useState("1234.5");
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get("price") ?? ""));
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "12px", maxInlineSize: "320px" }}
      onSubmit={onSubmit}
    >
      <XhNumberFieldRoot
        value={price}
        onValueChange={details => setPrice(details.value)}
        label="单价"
        name="price"
        locale="zh-CN"
        formatOptions={currency}
        min={0}
        step={10}
      />
      <XhButton type="submit" variant="outline" style={{ alignSelf: "start" }}>提交</XhButton>
      <span data-demo-output>{`值：${price} · 表单收到：${submitted || "（还没提交）"}`}</span>
    </form>
  );
}
