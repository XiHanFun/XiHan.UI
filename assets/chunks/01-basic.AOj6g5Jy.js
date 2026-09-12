const n=`// 基础用法 | 值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
];

export default function Demo(): ReactNode {
  const [toppings, setToppings] = useState<string[]>(["cheese"]);

  return (
    <>
      {/* 交出 collection 即可，组标题与每个条目的方框、文本由组件按数据铺开 */}
      <XhCheckboxGroupRoot
        value={toppings}
        onValueChange={details => setToppings(details.value)}
        collection={items}
        label="配料"
        name="topping"
      />
      <span>{\`当前：\${toppings.join("、") || "（无）"}\`}</span>
    </>
  );
}
`;export{n as default};
