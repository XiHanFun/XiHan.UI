// 增删标签 | 行尾的新增钮与关闭钮只发意图，标签序由数据源持有；条目上的 closable 让「概览」固定不可关
import type { ReactNode } from "react";
import {
  XhTabsAddTrigger,
  XhTabsCloseTrigger,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { Fragment, useRef, useState } from "react";

interface Tab {
  value: string;
  label: string;
  closable?: boolean;
}

export default function Demo(): ReactNode {
  const [tabs, setTabs] = useState<Tab[]>([
    { value: "overview", label: "概览", closable: false },
    { value: "draft-1", label: "草稿 1" },
    { value: "draft-2", label: "草稿 2" },
  ]);
  const [selected, setSelected] = useState<string | null>("overview");
  const next = useRef(3);

  // 新建的标签追加到末尾并选中它：焦点留在新增钮上，Shift+Tab 回到这枚新标签
  function add(): void {
    const value = `draft-${next.current}`;
    setTabs([...tabs, { value, label: `草稿 ${next.current}` }]);
    setSelected(value);
    next.current += 1;
  }

  // 关掉的是选中标签时，选中挪到原位置上的下一枚（没有就是上一枚）
  function close(details: { value: string; values: string[] }): void {
    const index = tabs.findIndex(tab => tab.value === details.value);
    setTabs(tabs.filter(tab => tab.value !== details.value));
    if (selected === details.value)
      setSelected(details.values[Math.min(index, details.values.length - 1)] ?? null);
  }

  return (
    <XhTabsRoot
      value={selected}
      collection={tabs}
      closable
      addable
      style={{ inlineSize: "420px", maxInlineSize: "100%" }}
      onValueChange={({ value }) => setSelected(value)}
      onTabAdd={add}
      onTabClose={close}
    >
      <XhTabsList aria-label="草稿">
        {tabs.map(tab => (
          <Fragment key={tab.value}>
            <XhTabsTrigger value={tab.value}>{tab.label}</XhTabsTrigger>
            <XhTabsCloseTrigger value={tab.value} />
          </Fragment>
        ))}
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsAddTrigger />

      {tabs.map(tab => (
        <XhTabsContent key={tab.value} value={tab.value}>
          {`${tab.label}的正文。`}
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  );
}
