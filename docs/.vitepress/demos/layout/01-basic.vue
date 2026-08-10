<!-- 基础用法 | 头与脚各横贯一行，侧栏与内容并排占中间那一行；少写一段就少一行或少一列 -->
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutFooter,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot
    bordered
    style="block-size: 280px; border-radius: 8px; overflow: hidden"
  >
    <XhLayoutHeader>控制台</XhLayoutHeader>
    <XhLayoutSider>导航</XhLayoutSider>
    <XhLayoutContent>
      正文区。四段都可缺省，只摆头和内容也是一副合法的骨架。
    </XhLayoutContent>
    <XhLayoutFooter>版本 1.0.0</XhLayoutFooter>
  </XhLayoutRoot>
</template>
