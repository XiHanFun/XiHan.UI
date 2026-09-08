// 标签用对象 | 组件里存的是标识那一份，显示哪一份由作者定：条目文本渲染 label，提交仍按标识拼串
import type { ReactNode } from "react";
import {
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

export default function Demo(): ReactNode {
  // 显示名与标识的对照表由宿主自己拿着，组件只认标识
  const [options, setOptions] = useState<Option[]>([
    { value: "u-1", label: "张三" },
    { value: "u-2", label: "李四" },
    { value: "u-3", label: "王五" },
  ]);

  const [value, setValue] = useState<string[]>(["u-1"]);
  const seq = useRef(0);

  function labelOf(id: string): string {
    return options.find(option => option.value === id)?.label ?? id;
  }

  // 组件报回来的是框里打的那串文本：同名的换成它的标识，没见过的现造一条对照
  function onValueChange(details: { value: string[] }): void {
    const known = [...options];
    const next: string[] = [];
    for (const raw of details.value) {
      const hit
        = known.find(option => option.value === raw)
          ?? known.find(option => option.label === raw);
      if (hit) {
        if (!next.includes(hit.value)) {
          next.push(hit.value);
        }
        continue;
      }
      seq.current += 1;
      const created = { value: `u-new-${seq.current}`, label: raw };
      known.push(created);
      next.push(created.value);
    }
    setOptions(known);
    setValue(next);
  }

  return (
    <>
      <XhTagsInputRoot
        value={value}
        onValueChange={onValueChange}
        name="reviewers"
        placeholder="打名字回车"
        style={{ maxInlineSize: "420px" }}
      >
        {({ value: tags }) => (
          <>
            <XhTagsInputLabel>评审人</XhTagsInputLabel>
            <XhTagsInputControl>
              {tags.map(t => (
                <XhTagsInputItem key={t} value={t}>
                  <XhTagsInputItemPreview>
                    <XhTagsInputItemText>{labelOf(t)}</XhTagsInputItemText>
                    <XhTagsInputItemDeleteTrigger />
                  </XhTagsInputItemPreview>
                </XhTagsInputItem>
              ))}
              <XhTagsInputInput />
            </XhTagsInputControl>
            <XhTagsInputHiddenInput />
          </>
        )}
      </XhTagsInputRoot>
      <p>{`提交出去的是标识：${value.join(",") || "（无）"}`}</p>
      <p>{`框里看到的是名字：${value.map(labelOf).join("、") || "（无）"}`}</p>
    </>
  );
}
