// 重置回默认值 | 复合控件的值攥在组件里，原生重置只还原原生控件——它们各自认这条事件，一起回到 defaultValue
import type { FormEvent, ReactNode } from "react";
import {
  XhButton,
  XhCheckbox,
  XhRadioGroupItem,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
  XhSwitch,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    setSubmitted([...data.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("  ") || "（空）");
  }

  return (
    <form style={{ display: "grid", gap: "12px" }} onSubmit={onSubmit}>
      <label>
        套餐
        <XhRadioGroupRoot name="plan" defaultValue="standard">
          <XhRadioGroupItem value="standard">标准</XhRadioGroupItem>
          <XhRadioGroupItem value="pro">专业</XhRadioGroupItem>
        </XhRadioGroupRoot>
      </label>

      <label>
        评分
        <XhRatingRoot name="score" defaultValue={3} count={5}>
          <XhRatingControl>
            {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
              <XhRatingItem key={i} value={i} />
            ))}
          </XhRatingControl>
        </XhRatingRoot>
      </label>

      {/* 原生输入框做对照：它靠 value 这个内容属性还原，组件靠自己的 defaultValue */}
      <label>
        备注
        <input name="note" defaultValue="默认备注" />
      </label>

      <label>
        <XhCheckbox name="agree" defaultChecked />
        {" "}
        已阅读条款
      </label>
      <label>
        <XhSwitch name="notify" />
        {" "}
        接收通知
      </label>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton type="submit" size="sm">提交</XhButton>
        {/* 原生 reset：组件与旁边那个原生输入框会一起回到各自的默认值 */}
        <XhButton type="reset" size="sm" variant="outline">重置</XhButton>
      </div>

      {submitted ? <span>{`表单收到：${submitted}`}</span> : null}
    </form>
  );
}
