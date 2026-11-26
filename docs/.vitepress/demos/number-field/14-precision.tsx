// 提交位数 | precision 决定保留几位小数：步进、取端点与失焦写回的值四舍五入并补齐，输入途中不动
import type { ReactNode } from "react";
import { XhNumberFieldRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [rate, setRate] = useState("3.50");

  return (
    <>
      {/* step 的小数位不多于 precision：每一步都落在两位小数的格点上 */}
      <XhNumberFieldRoot
        value={rate}
        onValueChange={details => setRate(details.value)}
        label="费率（%）"
        precision={2}
        step={0.25}
        min={0}
        max={100}
      />
      <span data-demo-output>{`值：${rate}`}</span>
    </>
  );
}
