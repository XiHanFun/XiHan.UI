const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滚动 | 固定高度显示长列表
import type { CSSProperties, ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";

const tracks = Array.from({ length: 12 }, (_, index) => ({
  value: \`track-\${index + 1}\`,
  label: \`曲目 \${String(index + 1).padStart(2, "0")}\`,
}));

export default function Demo(): ReactNode {
  return (
    <XhListboxRoot
      collection={tracks}
      defaultValue={["track-1"]}
      label="播放列表"
      style={{ "inlineSize": "min(100%, 300px)", "--xh-listbox-content-max-h": "180px" } as CSSProperties}
    />
  );
}
`;export{n as default};
