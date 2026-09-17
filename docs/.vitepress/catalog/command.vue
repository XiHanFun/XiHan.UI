<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import {
  XhCommandContent,
  XhCommandGroup,
  XhCommandGroupLabel,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const commands: CommandNode[] = [
  { value: "users", label: "用户管理", group: "nav" },
  { value: "export", label: "导出报表", group: "action" },
];
const groups = [
  { value: "nav", label: "页面" },
  { value: "action", label: "动作" },
];
// 面板 portal 到这块预览根里；卡片的 contain: layout paint 把 fixed 定位层圈成卡内包含块
const host = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="host"
    style="position: relative; inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h); --xh-command-max-w: var(--xh-doc-catalog-w); --xh-command-inset-block-start: var(--xh-space-3)"
  >
    <XhCommandRoot v-if="host" :collection="commands" :groups="groups" default-open :modal="false" :close-on-interact-outside="false" placeholder="搜命令…">
      <template #default>
        <XhCommandContent :container="host">
          <XhCommandInput />
          <XhCommandList>
            <XhCommandGroup v-for="group in groups" :key="group.value" :value="group.value">
              <XhCommandGroupLabel>{{ group.label }}</XhCommandGroupLabel>
              <template v-for="command in commands" :key="command.value">
                <XhCommandItem v-if="command.group === group.value" :value="command.value">
                  <XhCommandItemText>{{ command.label }}</XhCommandItemText>
                </XhCommandItem>
              </template>
            </XhCommandGroup>
          </XhCommandList>
        </XhCommandContent>
      </template>
    </XhCommandRoot>
  </div>
</template>
