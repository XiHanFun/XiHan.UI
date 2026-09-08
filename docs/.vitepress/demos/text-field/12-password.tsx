// 密码与明暗切换 | 写在 input 部件上的 type 盖过默认的 text，明暗由宿主的一个布尔翻转
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [visible, setVisible] = useState(false);

  return (
    // React 这档的 type 收在 root 的 props 里，input 部件上不再接同名属性
    <XhTextFieldRoot
      type={visible ? "text" : "password"}
      placeholder="请输入密码"
      maxLength={20}
    >
      <XhTextFieldLabel>密码</XhTextFieldLabel>
      <div style={{ display: "flex", gap: "4px" }}>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput autoComplete="current-password" />
        </XhTextFieldControl>
        <button type="button" aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? "隐藏" : "显示"}
        </button>
      </div>
    </XhTextFieldRoot>
  );
}
