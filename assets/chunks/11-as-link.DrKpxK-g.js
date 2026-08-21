const t=`<!-- 渲染成链接 | 皮肤认的是 data-scope 与 data-part 这组契约，不是标签名：把契约铺到链接元素上就得到导航型按钮，跳转仍由浏览器原生完成 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
<\/script>

<template>
  <XhButton variant="solid">留在本页</XhButton>

  <!-- 根部件的两个契约属性铺上去就够；形态与档位照常由 data-variant、data-size 给 -->
  <a
    href="/introduction"
    data-scope="button"
    data-part="root"
    data-variant="solid"
    style="text-decoration: none"
  >
    去简介
  </a>

  <a
    href="/guide/anatomy"
    data-scope="button"
    data-part="root"
    data-variant="outline"
    data-size="sm"
    style="text-decoration: none"
  >
    看解剖
  </a>
</template>
`;export{t as default};
