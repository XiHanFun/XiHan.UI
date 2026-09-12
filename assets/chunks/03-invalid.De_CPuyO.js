const e=`// 无效态 | invalid 一翻，错误文案接进描述链并显出；它带 role=alert，翻转那一刻读屏立即播报
import type { ReactNode } from "react";
import {
  XhFieldsetDescription,
  XhFieldsetErrorText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // 整组的校验结论由宿主判定，字段集只负责把它铺成属性
  const invalid = email === "" && phone === "";

  return (
    <XhFieldsetRoot invalid={invalid} style={{ inlineSize: "320px" }}>
      <XhFieldsetLegend>联系方式</XhFieldsetLegend>
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ inlineSize: "100%" }}
      />
      <input
        type="tel"
        placeholder="手机号"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={{ inlineSize: "100%" }}
      />
      <XhFieldsetDescription>两者填一个即可</XhFieldsetDescription>
      <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
    </XhFieldsetRoot>
  );
}
`;export{e as default};
