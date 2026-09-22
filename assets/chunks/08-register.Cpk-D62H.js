const n=`// 注册表单 | 提供 name 后才参与提交，auto-complete 写为 new-password 密码管理器才会保存新密码而不是填入旧密码
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
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
      <button type="reset">重置</button>
    </form>
  );
}
`;export{n as default};
