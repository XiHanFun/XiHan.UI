const e=`// 流式追加 | 代码还在写的时候默认不着色：半截代码的词法本来就不稳，每来一个字符整块变色比不着色更糟
import type { ReactNode } from "react";
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/react";
import { useEffect, useState } from "react";

const full = \`async function load(id: string) {
  const res = await fetch(\\\`/api/items/\\\${id}\\\`)
  return res.json()
}\`;

export default function Demo(): ReactNode {
  const [code, setCode] = useState("");
  const [complete, setComplete] = useState(false);

  // 追加放在效应里：组件函数体在服务端渲染时也执行，那里没有 window
  useEffect(() => {
    if (code.length >= full.length) {
      setComplete(true);
      return;
    }
    const timer = window.setTimeout(() => setCode(full.slice(0, code.length + 2)), 60);
    return () => window.clearTimeout(timer);
  }, [code]);

  return (
    // complete 翻真的那一刻着色才上；高度一直按当前行数撑着，不会一跳一跳
    <XhCodeViewRoot
      code={code}
      complete={complete}
      lang="typescript"
      style={{ inlineSize: "100%" }}
    >
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  );
}
`;export{e as default};
