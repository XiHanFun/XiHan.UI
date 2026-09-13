const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 链接 | 保留原生导航能力
import type { ReactNode } from "react";
import { XhButton } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhButton as="a" href="/introduction">了解更多</XhButton>;
}
`;export{n as default};
