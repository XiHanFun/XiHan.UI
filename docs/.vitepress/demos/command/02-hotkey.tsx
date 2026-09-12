// 快捷键唤起 + 手写部件 | Mod+K 打开，命中的字由文本高亮标出来，行尾挂各命令自己的快捷键
import type { CommandNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCommandContent,
  XhCommandEmpty,
  XhCommandFooter,
  XhCommandGroup,
  XhCommandGroupLabel,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandRoot,
  XhHighlight,
  XhHotkeys,
  XhKbdGroup,
} from "@xihan-ui/react";
import { useState } from "react";

// 行尾那一串是这条命令自己的快捷键，与全局绑定同一套写法
const commands: (CommandNode & { hotkey?: string[] })[] = [
  { value: "new", label: "新建文档", group: "file", hotkey: ["Mod", "N"] },
  { value: "save", label: "保存", group: "file", hotkey: ["Mod", "S"] },
  { value: "search", label: "全局搜索", group: "file", keywords: ["search"] },
  { value: "theme", label: "切换主题", group: "view" },
  { value: "zen", label: "专注模式", group: "view" },
];

const groups = [
  { value: "file", label: "文件" },
  { value: "view", label: "视图" },
];

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 唤起的入口：监听装在整篇文档上，面板收着也按得出来 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhKbdGroup keys={["Mod", "K"]} />
        <XhHotkeys keys={["Mod", "K"]} onHotKey={() => setOpen(true)} />
        <span>按一下唤起命令面板</span>
      </div>

      {/* 写了默认插槽即整套手写：铺开的那一份让位，行为一模一样 */}
      <XhCommandRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        collection={commands}
        groups={groups}
        placeholder="搜命令…"
      >
        {({ inputValue }) => (
          <XhCommandContent>
            <XhCommandInput />
            <XhCommandList>
              {groups.map(group => (
                <XhCommandGroup key={group.value} value={group.value}>
                  <XhCommandGroupLabel>{group.label}</XhCommandGroupLabel>
                  {/* 铺的是整份清单，不是筛出来的那几条：此刻露不露面由组件打的 hidden 说了算 */}
                  {commands
                    .filter(command => command.group === group.value)
                    .map(command => (
                      <XhCommandItem key={command.value} value={command.value}>
                        <XhCommandItemText>
                          {/* 检索串就是高亮的关键词，用户看得见这条为什么被选出来 */}
                          <XhHighlight text={command.label} keyword={inputValue} />
                        </XhCommandItemText>
                        {command.hotkey && <XhKbdGroup keys={command.hotkey} size="sm" />}
                      </XhCommandItem>
                    ))}
                </XhCommandGroup>
              ))}
            </XhCommandList>
            <XhCommandEmpty>没有匹配的命令</XhCommandEmpty>
            <XhCommandFooter>↑↓ 选择 · ↵ 执行 · Esc 关闭</XhCommandFooter>
          </XhCommandContent>
        )}
      </XhCommandRoot>
    </>
  );
}
