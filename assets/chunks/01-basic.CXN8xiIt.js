const e=`// 基础用法 | 为输入框添加固定前缀
import type { ReactNode } from "react";
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhInputGroupRoot>
      <XhInputGroupItem>
        <svg aria-hidden="true" viewBox="0 0 20 20" style={{ inlineSize: "1em", blockSize: "1em" }}>
          <path d="M2.5 5.5 10 10.75 17.5 5.5M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </XhInputGroupItem>
      <XhTextFieldRoot type="email" placeholder="name@example.com">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="邮箱地址" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>
  );
}
`;export{e as default};
