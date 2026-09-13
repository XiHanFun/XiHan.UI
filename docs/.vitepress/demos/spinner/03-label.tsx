/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 可见文案 | label 部件不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字
import type { ReactNode } from "react";
import { XhSpinner, XhSpinnerLabel } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      {/* 文案只写在 label prop 上，部件自己把它显示出来 */}
      <XhSpinner label="正在加载数据">
        <XhSpinnerLabel />
      </XhSpinner>

      {/* 换语言包同理：label → translations.label → 内置默认值，取第一段有字的 */}
      <XhSpinner translations={{ label: "正在提交表单" }}>
        <XhSpinnerLabel />
      </XhSpinner>
    </>
  );
}
