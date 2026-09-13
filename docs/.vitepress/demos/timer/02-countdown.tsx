/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 倒着走 | countdown 让它从起始值往下走，终点缺省是 0；走到终点就停在那里不再往下
import type { ReactNode } from "react";
import { XhTimerRoot } from "@xihan-ui/react";

const twoMinutes = 2 * 60 * 1000;

export default function Demo(): ReactNode {
  return <XhTimerRoot countdown startMs={twoMinutes} autoStart />;
}
