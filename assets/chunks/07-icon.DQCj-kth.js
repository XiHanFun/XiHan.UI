const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自定义图标 | 条目可使用首方图标，也可留空使用皮肤默认星形
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      <XhRatingRoot defaultValue={3}>
        {({ items }) => (
          <>
            <XhRatingLabel>换个字形</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}><XhIcon icon={HeartIcon} /></XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={2} allowHalf>
        {({ items }) => (
          <>
            <XhRatingLabel>内置星形与半档</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i} />
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>
    </div>
  );
}
`;export{n as default};
