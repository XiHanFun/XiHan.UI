const t=`// 文本前后缀 | 添加协议和域名后缀
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
      <XhInputGroupItem>https://</XhInputGroupItem>
      <XhTextFieldRoot placeholder="xihan">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="站点地址" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <XhInputGroupItem>.dev</XhInputGroupItem>
    </XhInputGroupRoot>
  );
}
`;export{t as default};
