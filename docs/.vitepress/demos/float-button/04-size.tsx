/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | 使用小、中、大三档尺寸
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return sizes.map(size => (
    <XhFloatButtonRoot key={size} style={{ position: "static" }} size={size}>
      <XhFloatButtonTrigger />
      <XhFloatButtonList />
    </XhFloatButtonRoot>
  ));
}
