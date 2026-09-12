// 底部操作区 | 固定在滚动列表下方
import type { ReactNode } from "react";
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectFooter,
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
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>([]);
  const [fruits, setFruits] = useState([
    { value: "apple", label: "苹果" },
    { value: "banana", label: "香蕉" },
    { value: "cherry", label: "樱桃" },
  ]);
  const seq = useRef(0);

  function addOne(): void {
    seq.current += 1;
    setFruits(prev => [...prev, { value: `new-${seq.current}`, label: `新水果 ${seq.current}` }]);
  }

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        placeholder="请选择"
      >
        <XhSelectLabel>水果</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            {/* 条目住在 list 里：role=listbox 只许拥有 option */}
            <XhSelectList>
              {fruits.map(f => (
                <XhSelectItem key={f.value} value={f.value}>
                  <XhSelectItemText>{f.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
            {/* 按钮放这里才不违反 listbox 的子节点约束；条目多到要滚时它也贴在下沿不动 */}
            <XhSelectFooter>
              <XhButton variant="ghost" size="sm" onClick={addOne}>＋ 新建</XhButton>
            </XhSelectFooter>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>

      <p>
        当前值：
        {picked[0] ?? "（未选）"}
      </p>
    </>
  );
}
