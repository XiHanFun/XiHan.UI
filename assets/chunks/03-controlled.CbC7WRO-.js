const e=`// 受控 | 传了 value 就由宿主说了算：组件只发 value-change，宿主写回它才变，这里把樱桃挡在门外
import type { ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃（选不中）" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["banana"]);
  const [rejected, setRejected] = useState(false);

  // 只有通过校验的值才写回，未写回则界面停在原值
  function onValueChange(details: { value: string[] }): void {
    const bad = details.value.includes("cherry");
    setRejected(bad);
    if (!bad)
      setValue(details.value);
  }

  return (
    <>
      <XhSelectRoot value={value} placeholder="请选择" onValueChange={onValueChange}>
        <XhSelectLabel>水果</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {fruits.map(f => (
                <XhSelectItem key={f.value} value={f.value}>
                  <XhSelectItemText>{f.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <p>{\`宿主持有的值：\${value.join("、")}\${rejected ? " · 上一次选择被拒绝" : ""}\`}</p>
    </>
  );
}
`;export{e as default};
