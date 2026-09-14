// 基础用法 | 不传 checked 即为非受控，开关自己维护状态
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSwitch />
      <XhSwitch defaultChecked />
    </>
  );
}
