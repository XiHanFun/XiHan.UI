const o=`// 多行输入宿主 | 输入部件写成 textarea 即多行宿主；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色
import type { ReactNode } from "react";
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const replies = [
  { value: "received", label: "已收到，稍后处理" },
  { value: "shipping", label: "商品已发出，请注意查收" },
  { value: "refund", label: "退款已提交，三个工作日内到账" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const q = draft.trim().toLowerCase();
  const filtered = q === "" ? replies : replies.filter(r => r.label.toLowerCase().includes(q));

  return (
    <>
      <XhComboboxRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        inputValue={draft}
        onInputValueChange={details => setDraft(details.inputValue)}
        allowCustomValue
      >
        <XhComboboxLabel>回复内容</XhComboboxLabel>
        <XhComboboxControl>
          {/* 换标签只此一处；键盘、高亮与选中回填的行为一律不变 */}
          {/* rows 只有 textarea 认，输入部件的属性表按 input 写，展开着传进去 */}
          <XhComboboxInput as="textarea" {...{ rows: 3 }} placeholder="挑一条常用语，或自己写" />
          <XhComboboxTrigger />
        </XhComboboxControl>
        <XhComboboxPositioner>
          <XhComboboxContent>
            {filtered.map(r => (
              <XhComboboxItem key={r.value} value={r.value}>
                <XhComboboxItemText>{r.label}</XhComboboxItemText>
                <XhComboboxItemIndicator />
              </XhComboboxItem>
            ))}
          </XhComboboxContent>
        </XhComboboxPositioner>
      </XhComboboxRoot>
      <p>{\`草稿：\${draft || "（空）"}\`}</p>
    </>
  );
}
`;export{o as default};
