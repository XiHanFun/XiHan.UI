const n=`// 尺寸 | size 只改高度、内边距与字号，标签、切换钮与大写锁定提示一起跟着换档；不写就是缺省档
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
      <XhPasswordInputRoot size="sm" defaultValue="hunter2">
        <XhPasswordInputLabel>sm</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot defaultValue="hunter2">
        <XhPasswordInputLabel>缺省</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot size="lg" defaultValue="hunter2">
        <XhPasswordInputLabel>lg</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "160px" }} />
          <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </>
  );
}
`;export{n as default};
