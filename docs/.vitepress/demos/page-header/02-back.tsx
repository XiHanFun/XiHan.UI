// 返回位 | 返回位就是作者自己的按钮：组件只给身份与位置，type、可及名字与点击行为自己写
import type { ReactNode } from "react";
import {
  XhPageHeaderBackTrigger,
  XhPageHeaderDescription,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [times, setTimes] = useState(0);

  return (
    <XhPageHeaderRoot>
      <XhPageHeaderBackTrigger type="button" aria-label="返回上一页" onClick={() => setTimes(times + 1)}>
        ←
      </XhPageHeaderBackTrigger>
      <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
      <XhPageHeaderDescription>{`已点返回 ${times} 次`}</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  );
}
