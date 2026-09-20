const t=`// 倒计时 | countdown 使它从起始值递减，终点默认是 0；到达终点即停在该处不再递减
import type { ReactNode } from "react";
import { XhTimerRoot } from "@xihan-ui/react";

const twoMinutes = 2 * 60 * 1000;

export default function Demo(): ReactNode {
  return <XhTimerRoot countdown startMs={twoMinutes} autoStart />;
}
`;export{t as default};
