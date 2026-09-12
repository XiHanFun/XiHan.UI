<!-- 底部操作区 | 固定在滚动列表下方 -->
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectFooter,
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

const picked = ref<string[]>([]);
const fruits = ref([
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
]);

let seq = 0;
function addOne() {
  seq += 1;
  fruits.value.push({ value: `new-${seq}`, label: `新水果 ${seq}` });
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <!-- 条目住在 list 里：role=listbox 只许拥有 option -->
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
        <!-- 按钮放这里才不违反 listbox 的子节点约束；条目多到要滚时它也贴在下沿不动 -->
        <XhSelectFooter>
          <XhButton variant="ghost" size="sm" @click="addOne">＋ 新建</XhButton>
        </XhSelectFooter>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>

  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
