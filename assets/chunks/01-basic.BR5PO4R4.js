const n=`// 基础用法 | root 持有状态，control 是那个视觉盒；不传 value 与 visible 即为非受控，明暗由组件自己管，钮里的图标跟着明暗换
import type { ReactNode } from "react";
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPasswordInputRoot
      placeholder="请输入密码"
      translations={{ capsLockOn: "大写锁定已打开" }}
    >
      {({ visible }) => (
        <>
          <XhPasswordInputLabel>密码</XhPasswordInputLabel>
          <XhPasswordInputControl>
            <XhPasswordInputInput style={{ inlineSize: "200px" }} />
            {/* 节点留空，大写锁定开着时组件把文字写进来，读屏念的就是这一段 */}
            <XhPasswordInputCapsLockIndicator />
            {/* 名字由组件按明暗写好；图标只管好看，读屏不念它，遮着时划一道斜杠 */}
            <XhPasswordInputVisibilityTrigger>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="3" />
                <path d={visible ? "" : "M4 4 20 20"} />
              </svg>
            </XhPasswordInputVisibilityTrigger>
          </XhPasswordInputControl>
        </>
      )}
    </XhPasswordInputRoot>
  );
}
`;export{n as default};
