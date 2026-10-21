var e=`// 折叠超长代码 | clamped 是纯受控的：组件只发意图，是否落实由宿主决定，便于全部展开这类操作统一持有
import type { ReactNode } from "react";
import { XhCodeViewCode, XhCodeViewFoldTrigger, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/react";
import { useState } from "react";

const sample = Array.from(
  { length: 24 },
  (_, i) => \`const step\${i + 1} = pipeline.at(\${i})\`,
).join("\\n");

// 读屏名由组件按折叠态取 translations 里的一句，钮上的字由作者写：两边取同一张表，看到的与读到的才对得上
const translations = { expand: "展开全部 24 行", collapse: "收起" };

export default function Demo(): ReactNode {
  const [clamped, setClamped] = useState(true);

  return (
    <XhCodeViewRoot
      clamped={clamped}
      onClampToggle={details => setClamped(details.clamped)}
      code={sample}
      lang="typescript"
      complete
      lineNumbers
      clamp={8}
      translations={translations}
      style={{ inlineSize: "100%" }}
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
      {/* 读屏名与 aria-expanded 由组件按折叠态翻面，钮上的字照同一张表跟着翻 */}
      <XhCodeViewFoldTrigger>
        {clamped ? translations.expand : translations.collapse}
      </XhCodeViewFoldTrigger>
    </XhCodeViewRoot>
  );
}
`;export{e as default};