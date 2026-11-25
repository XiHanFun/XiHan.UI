<!-- 受控 | 由 value 和 value-change 控制；外部按钮经插槽状态的 setOpen 与 setValue 开合与清空，改值同样经 value-change 回到宿主 -->
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

const value = ref<string[]>(["banana"]);
const rejected = ref(false);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃（选不中）" },
];

// 只有通过校验的值才写回，未写回则界面停在原值
function onValueChange(details: { value: string[] }) {
  rejected.value = details.value.includes("cherry");
  if (!rejected.value)
    value.value = details.value;
}
</script>

<template>
  <XhSelectRoot
    v-slot="{ open, setOpen, setValue }"
    :value="value"
    placeholder="请选择"
    @value-change="onValueChange"
  >
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <div style="display: flex; gap: var(--xh-space-2); margin-block-start: var(--xh-space-2)">
      <XhButton variant="outline" size="sm" @click="setOpen(!open)">
        {{ open ? "收起" : "展开" }}
      </XhButton>
      <XhButton variant="ghost" size="sm" :disabled="value.length === 0" @click="setValue([])">
        清空
      </XhButton>
    </div>
  </XhSelectRoot>
  <p data-demo-output>宿主持有的值：{{ value.join("、") || "（空）" }}{{ rejected ? " · 上一次选择被拒绝" : "" }}</p>
</template>
