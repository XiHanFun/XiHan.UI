var e=`// 无效态 | invalid 切换后，错误文案接入描述链并显示；它带 role=alert，切换时读屏立即播报
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
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
      <XhFieldRoot>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </XhFieldControl>
      </XhFieldRoot>
      <XhFieldRoot>
        <XhFieldLabel>手机号</XhFieldLabel>
        <XhFieldControl>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </XhFieldControl>
      </XhFieldRoot>
      <XhFieldsetDescription>两者填一个即可</XhFieldsetDescription>
      <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
    </XhFieldsetRoot>
  );
}
`;export{e as default};