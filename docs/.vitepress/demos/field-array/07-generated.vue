<!-- 不写结构 | 只给每一行的内容：行号、删除与新增把手由组件铺，每行的内容按行交给组件 -->
<script setup lang="ts">
import { XhFieldArrayRoot, XhTextFieldRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const links = ref<string[]>(["https://xihan.fun", ""]);

// 行里的控件是作者自己的，值也由作者自己写回
function setAt(index: number, next: string) {
  links.value = links.value.map((item, i) => (i === index ? next : item));
}
</script>

<template>
  <XhFieldArrayRoot
    v-model:value="links"
    :create-item="() => ''"
    style="inline-size: 100%; max-inline-size: 420px"
  >
    <template #item-content="{ item }">
      <XhTextFieldRoot
        placeholder="填一个链接"
        :value="item.value"
        @update:value="(next: string) => setAt(item.index, next)"
      />
    </template>
  </XhFieldArrayRoot>
</template>
