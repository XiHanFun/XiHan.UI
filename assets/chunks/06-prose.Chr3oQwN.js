const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 富文本 | 排版外部 HTML 内容
import type { ReactNode } from "react";
import { XhTypographyProse, XhTypographyRoot } from "@xihan-ui/react";

const html = \`
  <h3>安装</h3>
  <p>安装 React 组件和默认样式。</p>
  <pre><code>pnpm add @xihan-ui/react @xihan-ui/styles</code></pre>
  <ul><li>组件按需引入</li><li>皮肤整份引入</li></ul>
\`;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      <XhTypographyProse dangerouslySetInnerHTML={{ __html: html }} />
    </XhTypographyRoot>
  );
}
`;export{n as default};
