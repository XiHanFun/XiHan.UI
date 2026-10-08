var e=`// 语气 | 颜色本身带好坏含义时写 tone：线与标记点整条取语气色；缺省 neutral 线取弱化色、末点取品牌色
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

// 近 10 分钟的错误率（%）：越高越糟，取危险色
const errors = [0.4, 0.5, 0.3, 0.6, 0.9, 1.4, 1.2, 1.8, 2.3, 2.1];

export default function Demo(): ReactNode {
  return <XhSparkline data={errors} tone="danger" aria-label="近 10 分钟错误率" />;
}
`;export{e as default};