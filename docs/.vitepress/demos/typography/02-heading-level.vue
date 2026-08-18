<!-- 标题档位 | level 只换字号档位，用哪个标签由作者定；不传 level 即默认档 -->
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyRoot } from "@xihan-ui/vue";

// as const 让每一项是字面量类型，才对得上 level 收的 1-6 联合
const levels = [1, 2, 3, 4, 5, 6] as const;
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyHeading v-for="l in levels" :key="l" :level="l">
      第 {{ l }} 档标题
    </XhTypographyHeading>
  </XhTypographyRoot>
</template>
