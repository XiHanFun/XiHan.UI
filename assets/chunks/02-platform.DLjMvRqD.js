const o=`// 平台 | 使用对应平台的修饰键格式
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhKbdGroup keys={["Mod", "S"]} platform="mac" />
      <XhKbdGroup keys={["Mod", "S"]} platform="other" />
    </>
  );
}
`;export{o as default};
