const e=`// 受控 | value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算
import type { ReactNode } from "react";
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhMenubarRoot value={value} onValueChange={details => setValue(details.value)}>
        <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
        <XhMenubarTrigger value="help">帮助</XhMenubarTrigger>

        <XhMenubarPositioner value="file">
          <XhMenubarContent>
            <XhMenubarItem value="save">
              <XhMenubarItemText>保存</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>

        <XhMenubarPositioner value="help">
          <XhMenubarContent>
            <XhMenubarItem value="about">
              <XhMenubarItemText>关于</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setValue("file")}>展开「文件」</button>
        <button type="button" onClick={() => setValue("help")}>展开「帮助」</button>
        <button type="button" onClick={() => setValue(null)}>全部收起</button>
        <span>{\`当前：\${value ?? "（都收起）"}\`}</span>
      </div>
    </div>
  );
}
`;export{e as default};
