const n=`// 形态 | ring 整圈、arc 一段弧、dots 三点；缺省档 ring 不输出 data-variant
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSpinner label="加载中" />
      <XhSpinner variant="arc" label="加载中" />
      <XhSpinner variant="dots" label="加载中" />
    </>
  );
}
`;export{n as default};
