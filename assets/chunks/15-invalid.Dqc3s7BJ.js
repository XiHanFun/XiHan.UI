const e=`<!-- 校验状态 | 校验结论由宿主给出：invalid 让触发器标红并输出 aria-invalid，错误文案用 aria-describedby 挂到触发器上 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
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

const departments = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>([]);
const invalid = computed(() => picked.value.length === 0);
<\/script>

<template>
  <XhSelectRoot v-model:value="picked" :invalid="invalid" placeholder="必须选一个">
    <XhSelectLabel>所属部门</XhSelectLabel>
    <XhSelectTrigger :aria-describedby="invalid ? 'select-invalid-tip' : undefined">
      <XhSelectValueText />
      <XhSelectIndicator />
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="d in departments" :key="d.value" :value="d.value">
            <XhSelectItemText>{{ d.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p v-if="invalid" id="select-invalid-tip" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
`;export{e as default};
