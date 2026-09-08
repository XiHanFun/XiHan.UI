// 受控 | 传了 value 就由宿主说了算，组件自己不再改选中值；切换意图从 value-change 出来，写回才真的切
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
  const [value, setValue] = useState<string | null>("account");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhTabsRoot value={value} onValueChange={details => setValue(details.value)}>
        <XhTabsList>
          <XhTabsTrigger value="account">账户</XhTabsTrigger>
          <XhTabsTrigger value="security">安全</XhTabsTrigger>
          <XhTabsTrigger value="notice">通知</XhTabsTrigger>
        </XhTabsList>

        <XhTabsContent value="account">账户面板</XhTabsContent>
        <XhTabsContent value="security">安全面板</XhTabsContent>
        <XhTabsContent value="notice">通知面板</XhTabsContent>
      </XhTabsRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton variant="outline" onClick={() => setValue("security")}>
          跳到安全
        </XhButton>
        <span>{`当前：${value}`}</span>
      </div>
    </div>
  );
}
