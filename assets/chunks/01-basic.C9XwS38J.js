const e=`// 基础用法 | 给 value 就画码，缺省 Code 128，任意 ASCII 都收；人读文字印在条下
import type { ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhBarCode value="XH-2026-0915" />;
}
`;export{e as default};
