const o=`// 富文本 | prose 收外来的整段 HTML：节点由内容自己带，样式按标签给
import type { ReactNode } from "react";
import { XhTypographyProse, XhTypographyRoot } from "@xihan-ui/react";

// Markdown 渲染器产出的那一串 HTML，这里直接写死当样例
const html = \`
  <h3>安装</h3>
  <p>包管理器装上 <code>@xihan-ui/react</code>，再把皮肤引进来。</p>
  <pre><code>pnpm add @xihan-ui/react @xihan-ui/styles</code></pre>
  <ul><li>组件按需引入</li><li>皮肤整份引入</li></ul>
  <blockquote>皮肤只引一次，重复引入会让层序失效。</blockquote>
\`;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      {/* 这个部件本来就是拿来放一段外来 HTML 的，它不收插槽内容 */}
      <XhTypographyProse dangerouslySetInnerHTML={{ __html: html }} />
    </XhTypographyRoot>
  );
}
`;export{o as default};
