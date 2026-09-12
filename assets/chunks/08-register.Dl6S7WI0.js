const n=`// 注册表单 | name 才让它参与提交，auto-complete 写成 new-password 密码管理器才去存新密码而不是填旧的
import type { ReactNode } from "react";
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 点表单的重置：值回到 default-value，明文也一并收起来
    <form style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
      <XhPasswordInputRoot name="new-password" autoComplete="new-password" defaultValue="" required>
        <XhPasswordInputLabel>设置新密码</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "200px" }} />
          <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
      <button type="reset">重置</button>
    </form>
  );
}
`;export{n as default};
