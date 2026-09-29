const e=`// 增删标签 | 关闭钮或 Delete 键关掉标签，新建按钮追加一枚；标签序由数据源持有
import type { ReactNode } from "react";
import {
  XhButton,
  XhTabsCloseTrigger,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { Fragment, useRef, useState } from "react";

interface Draft {
  value: string;
  label: string;
}

export default function Demo(): ReactNode {
  const [drafts, setDrafts] = useState<Draft[]>([
    { value: "draft-1", label: "草稿 1" },
    { value: "draft-2", label: "草稿 2" },
    { value: "draft-3", label: "草稿 3" },
  ]);
  const [selected, setSelected] = useState<string | null>("draft-1");
  const next = useRef(4);

  function add(): void {
    const value = \`draft-\${next.current}\`;
    setDrafts([...drafts, { value, label: \`草稿 \${next.current}\` }]);
    setSelected(value);
    next.current += 1;
  }

  // 关掉的是选中标签时，选中挪到原位置上的下一枚（没有就是上一枚）
  function close(details: { value: string; values: string[] }): void {
    const index = drafts.findIndex(draft => draft.value === details.value);
    setDrafts(drafts.filter(draft => draft.value !== details.value));
    if (selected === details.value)
      setSelected(details.values[Math.min(index, details.values.length - 1)] ?? null);
  }

  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", inlineSize: "420px", maxInlineSize: "100%" }}>
      <XhButton variant="outline" style={{ justifySelf: "start" }} onClick={add}>新建草稿</XhButton>
      <XhTabsRoot
        value={selected}
        collection={drafts}
        closable
        onValueChange={({ value }) => setSelected(value)}
        onTabClose={close}
      >
        <XhTabsList aria-label="草稿">
          {drafts.map(draft => (
            <Fragment key={draft.value}>
              <XhTabsTrigger value={draft.value}>{draft.label}</XhTabsTrigger>
              <XhTabsCloseTrigger value={draft.value} />
            </Fragment>
          ))}
          <XhTabsIndicator />
        </XhTabsList>

        {drafts.map(draft => (
          <XhTabsContent key={draft.value} value={draft.value}>
            {\`\${draft.label}的正文。\`}
          </XhTabsContent>
        ))}
      </XhTabsRoot>
    </div>
  );
}
`;export{e as default};
