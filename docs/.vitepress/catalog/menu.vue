<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuContent, XhMenuItem, XhMenuRoot, XhMenuSeparator, XhMenuTrigger } from "@xihan-ui/vue";
</script>

<template>
  <!-- 受控常开：预览只看得见、点不着，浮层就地铺在触发器下 -->
  <XhMenuRoot :open="true" trigger-as-child>
    <div style="display: grid; justify-items: start; gap: 6px">
      <XhMenuTrigger>
        <XhButton variant="subtle" size="sm">
          操作
          <XhIcon :icon="ChevronDownIcon" />
        </XhButton>
      </XhMenuTrigger>
      <XhMenuContent style="position: static; inline-size: 160px">
        <XhMenuItem value="new">新建文件</XhMenuItem>
        <XhMenuItem value="open">打开文件</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">移到回收站</XhMenuItem>
      </XhMenuContent>
    </div>
  </XhMenuRoot>
</template>
