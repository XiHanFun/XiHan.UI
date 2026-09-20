const t=`// 基础用法 | 提供 value 即绘制码，版本按内容长度自动选择；默认 M 级纠错、4 个模块的静区
import type { ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhMatrixCode value="https://ui.xihanfun.com" />;
}
`;export{t as default};
