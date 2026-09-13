const t=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 无分隔线 | 省略分隔线部件
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup separators={false}>
      <XhButton>照片</XhButton>
      <XhButton>视频</XhButton>
      <XhButton>更多</XhButton>
    </XhButtonGroup>
  );
}
`;export{t as default};
