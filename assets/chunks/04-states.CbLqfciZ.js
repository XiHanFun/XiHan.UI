const n=`// 禁用与校验态 | disabled 连明暗切换一起停止，read-only 只锁定值、明暗照常切换，invalid 只标注不拦截输入
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
    <>
      <XhPasswordInputRoot defaultValue="hunter2" disabled>
        <XhPasswordInputLabel>禁用</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot defaultValue="hunter2" readOnly>
        <XhPasswordInputLabel>只读</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot defaultValue="123" invalid>
        <XhPasswordInputLabel>校验失败</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </>
  );
}
`;export{n as default};
