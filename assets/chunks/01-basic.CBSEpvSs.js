const e=`// 基础用法 | 除了 root，返回位、副标题、操作、页脚都可选；只写用得上的那几段
import type { ReactNode } from "react";
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPageHeaderRoot>
      <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
      <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  );
}
`;export{e as default};
