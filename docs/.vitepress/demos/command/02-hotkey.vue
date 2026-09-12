<!-- 快捷键唤起 + 手写部件 | Mod+K 打开，命中的字由文本高亮标出来，行尾挂各命令自己的快捷键 -->
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
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
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);

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
</script>

<template>
  <!-- 唤起的入口：监听装在整篇文档上，面板收着也按得出来 -->
  <div style="display: flex; align-items: center; gap: 8px">
    <XhKbdGroup :keys="['Mod', 'K']" />
    <XhHotkeys :keys="['Mod', 'K']" @hot-key="open = true" />
    <span>按一下唤起命令面板</span>
  </div>

  <!-- 写了默认插槽即整套手写：铺开的那一份让位，行为一模一样 -->
  <XhCommandRoot
    v-model:open="open"
    :collection="commands"
    :groups="groups"
    placeholder="搜命令…"
  >
    <template #default="{ inputValue }">
      <XhCommandContent>
        <XhCommandInput />
        <XhCommandList>
          <XhCommandGroup v-for="group in groups" :key="group.value" :value="group.value">
            <XhCommandGroupLabel>{{ group.label }}</XhCommandGroupLabel>
            <!-- 铺的是整份清单，不是筛出来的那几条：此刻露不露面由组件打的 hidden 说了算 -->
            <template v-for="command in commands" :key="command.value">
              <XhCommandItem v-if="command.group === group.value" :value="command.value">
                <XhCommandItemText>
                  <!-- 检索串就是高亮的关键词，用户看得见这条为什么被选出来 -->
                  <XhHighlight :text="command.label!" :keyword="inputValue" />
                </XhCommandItemText>
                <XhKbdGroup v-if="command.hotkey" :keys="command.hotkey" size="sm" />
              </XhCommandItem>
            </template>
          </XhCommandGroup>
        </XhCommandList>
        <XhCommandEmpty>没有匹配的命令</XhCommandEmpty>
        <XhCommandFooter>↑↓ 选择 · ↵ 执行 · Esc 关闭</XhCommandFooter>
      </XhCommandContent>
    </template>
  </XhCommandRoot>
</template>
