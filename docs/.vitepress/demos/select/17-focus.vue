<!-- 命令式聚焦 | 聚焦触发器 -->
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
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
import { ref } from "vue";

const levels = [
  { value: "p0", label: "紧急" },
  { value: "p1", label: "高" },
  { value: "p2", label: "普通" },
];

const picked = ref<string[]>([]);
const trigger = ref<InstanceType<typeof XhSelectTrigger> | null>(null);
const submitted = ref(false);

// 提交时没选值就把焦点送回触发器
function submit(): void {
  submitted.value = true;
  if (picked.value.length === 0)
    trigger.value?.$el.focus();
}

</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>优先级</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger ref="trigger">
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="l in levels" :key="l.value" :value="l.value">
            <XhSelectItemText>{{ l.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <div style="display: flex; gap: 8px; margin-block-start: 8px">
    <XhButton variant="outline" size="sm" @click="submit">提交</XhButton>
  </div>
  <p v-if="submitted && picked.length === 0" style="color: var(--xh-fg-danger)">
    还没选优先级，焦点已回到选择器
  </p>
</template>
