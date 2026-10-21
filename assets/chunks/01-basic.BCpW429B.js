var e=`// 基础用法 | 先选种类，再填这一种的参数，下方显示样例；派发的值是一份格式说明，交给格式化即可
import type { FormatSpec } from "@xihan-ui/expression";
import type { ReactNode } from "react";
import { XhFormatInputRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [format, setFormat] = useState<FormatSpec | null>({ kind: "number", decimals: 2, grouping: true });

  return (
    <>
      <XhFormatInputRoot value={format} onValueChange={details => setFormat(details.value)} aria-label="金额格式" />
      <p data-demo-output>{\`值：\${format === null ? "（不设格式）" : JSON.stringify(format)}\`}</p>
    </>
  );
}
`;export{e as default};