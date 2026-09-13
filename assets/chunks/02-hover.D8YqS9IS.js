const t=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 悬停展开 | 指针进入时展开，键盘与触控仍可点击 -->
<script setup lang="ts">
import { MessageCircleIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFloatButtonRoot style="position: static" expand-trigger="hover">
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
      <button type="button" aria-label="分享"><XhIcon :icon="ShareIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
`;export{t as default};
