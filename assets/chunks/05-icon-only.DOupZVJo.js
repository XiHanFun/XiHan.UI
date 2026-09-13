const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 仅图标 | 紧凑的图标操作
import type { ReactNode } from "react";
import { HeartIcon, SearchIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton iconOnly aria-label="搜索"><XhIcon icon={SearchIcon} /></XhButton>
      <XhButton iconOnly variant="subtle" aria-label="收藏"><XhIcon icon={HeartIcon} /></XhButton>
      <XhButton iconOnly variant="outline" aria-label="搜索"><XhIcon icon={SearchIcon} /></XhButton>
      <XhButton iconOnly variant="ghost" aria-label="收藏"><XhIcon icon={HeartIcon} /></XhButton>
    </>
  );
}
`;export{n as default};
