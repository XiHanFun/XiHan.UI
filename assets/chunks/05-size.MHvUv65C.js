const e=`<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比 -->
<script setup lang="ts">
import { XhMenuRoot } from "@xihan-ui/vue";

const account = [
  { value: "profile", label: "个人资料" },
  { value: "settings", label: "偏好设置" },
  { value: "logout", label: "退出登录" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot :collection="account" size="sm">
      <template #trigger>sm</template>
    </XhMenuRoot>

    <!-- 不写 size 就是缺省档 -->
    <XhMenuRoot :collection="account">
      <template #trigger>缺省</template>
    </XhMenuRoot>

    <XhMenuRoot :collection="account" size="lg">
      <template #trigger>lg</template>
    </XhMenuRoot>
  </div>
</template>
`;export{e as default};
