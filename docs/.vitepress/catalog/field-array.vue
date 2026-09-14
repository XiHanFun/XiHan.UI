<script setup lang="ts">
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
} from "@xihan-ui/vue";

const links = ["https://xihan.fun", ""];
</script>

<template>
  <XhFieldArrayRoot v-slot="{ items }" :default-value="links" :create-item="() => ''" style="inline-size: 230px">
    <XhFieldArrayItem v-for="row in items" :key="row.key" :index="row.index">
      <XhFieldArrayItemContent>
        <input class="xh-demo-control" style="inline-size: 100%" placeholder="填一个链接" :value="row.value">
      </XhFieldArrayItemContent>
      <XhFieldArrayItemAction>
        <XhFieldArrayItemDeleteTrigger />
      </XhFieldArrayItemAction>
    </XhFieldArrayItem>
    <XhFieldArrayAddTrigger>+ 添加链接</XhFieldArrayAddTrigger>
  </XhFieldArrayRoot>
</template>
