const n=`// 拦截切换 | 受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动
import type { ReactNode } from "react";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("draft");
  const [dirty, setDirty] = useState(true);
  const [notice, setNotice] = useState("");

  // 只单向绑 value，写不写回由这里说了算
  function onValueChange(details: { value: string | null }): void {
    if (dirty) {
      setNotice("草稿还没保存，切不过去");
      return;
    }
    setNotice("");
    setValue(details.value ?? value);
  }

  function save(): void {
    setDirty(false);
    setNotice("已保存，现在可以切走了");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhTabsRoot value={value} onValueChange={onValueChange}>
        <XhTabsList>
          <XhTabsTrigger value="draft">草稿</XhTabsTrigger>
          <XhTabsTrigger value="preview">预览</XhTabsTrigger>
          <XhTabsTrigger value="publish">发布</XhTabsTrigger>
        </XhTabsList>

        <XhTabsContent value="draft">草稿面板：内容改过还没保存。</XhTabsContent>
        <XhTabsContent value="preview">预览面板。</XhTabsContent>
        <XhTabsContent value="publish">发布面板。</XhTabsContent>
      </XhTabsRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton variant="outline" disabled={!dirty} onClick={save}>
          保存草稿
        </XhButton>
        <span>{notice || \`当前：\${value}\`}</span>
      </div>
    </div>
  );
}
`;export{n as default};
