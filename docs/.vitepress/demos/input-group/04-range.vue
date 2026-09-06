<!-- 区间输入 | 组里放两个输入框，中间夹一个前后缀块当连接词：三段共用两条中缝，圆角只留在最外两端；两头各自带 aria-label，读屏分得清哪个是起点 -->
<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const min = ref("100");
const max = ref("800");

const summary = computed(() => {
  if (!min.value && !max.value) {
    return "不限";
  }
  if (!min.value) {
    return `${max.value} 元以下`;
  }
  if (!max.value) {
    return `${min.value} 元以上`;
  }
  return `${min.value} — ${max.value} 元`;
});
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <XhInputGroupRoot>
      <XhInputGroupItem>￥</XhInputGroupItem>
      <XhTextFieldRoot v-model:value="min" placeholder="最低价">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="最低价" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <!-- 连接词也是一段：与两侧同高、同一条描边，它是这个盒的一部分 -->
      <XhInputGroupItem>至</XhInputGroupItem>
      <XhTextFieldRoot v-model:value="max" placeholder="最高价">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="最高价" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>

    <p style="font-size: 13px; opacity: 0.75">价格区间：{{ summary }}</p>
  </div>
</template>
