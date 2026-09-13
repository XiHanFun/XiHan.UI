/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | 单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版", disabled: true },
];
const openPlans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhRadioGroupRoot collection={plans} defaultValue="free" label="单项禁用" />

      <XhRadioGroupRoot
        collection={openPlans}
        defaultValue="free"
        disabled
        label="整组禁用"
      />
    </>
  );
}
