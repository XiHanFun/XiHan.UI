const n=`// 形态 | variant 决定底色与描边的绘制方式：描边、淡色填底、无框；密码框没有实心档
import type { ReactNode } from "react";
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {variants.map(v => (
        <XhPasswordInputRoot key={v} variant={v} defaultValue="hunter2">
          <XhPasswordInputLabel>{v}</XhPasswordInputLabel>
          <XhPasswordInputControl>
            <XhPasswordInputInput />
            <XhPasswordInputVisibilityTrigger />
          </XhPasswordInputControl>
        </XhPasswordInputRoot>
      ))}
    </>
  );
}
`;export{n as default};
