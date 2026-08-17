<!-- 选项里的自定义内容 | 条目与触发器显示都是插槽：内容想写什么写什么，选中与键盘行为不变 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhAvatarFallback,
  XhAvatarImage,
  XhAvatarRoot,
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const members = [
  { value: "liuyi", name: "刘一", initial: "刘", team: "设计组" },
  { value: "chener", name: "陈二", initial: "陈", team: "前端组" },
  { value: "zhangsan", name: "张三", initial: "张", team: "服务端组" },
];

const picked = ref<string[]>(["liuyi"]);
const current = computed(() => members.find((m) => m.value === picked.value[0]) ?? null);
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择成员">
    <XhSelectLabel>负责人</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText>
        <span v-if="current" style="display: inline-flex; align-items: center; gap: 8px">
          <XhAvatarRoot size="sm">
            <XhAvatarImage />
            <XhAvatarFallback>{{ current.initial }}</XhAvatarFallback>
          </XhAvatarRoot>
          {{ current.name }}
        </span>
        <span v-else>请选择成员</span>
      </XhSelectValueText>
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="m in members" :key="m.value" :value="m.value">
            <XhSelectItemText>
              <span style="display: inline-flex; align-items: center; gap: 8px">
                <XhAvatarRoot size="sm">
                  <XhAvatarImage />
                  <XhAvatarFallback>{{ m.initial }}</XhAvatarFallback>
                </XhAvatarRoot>
                <span>
                  {{ m.name }}
                  <span style="color: var(--xh-fg-muted); font-size: 12px">{{ m.team }}</span>
                </span>
              </span>
            </XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
</template>
