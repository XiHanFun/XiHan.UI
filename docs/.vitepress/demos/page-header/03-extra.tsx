// 行尾操作 | extra 贴在整行的末尾，里面放什么按钮由作者决定
import type { ReactNode } from "react";
import {
  XhPageHeaderDescription,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPageHeaderRoot>
      <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
      <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
      <XhPageHeaderExtra>
        <button type="button">导出</button>
        <button type="button">打印</button>
      </XhPageHeaderExtra>
    </XhPageHeaderRoot>
  );
}
