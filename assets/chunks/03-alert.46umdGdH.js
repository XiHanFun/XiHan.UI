const n=`<!-- 警示对话框 | role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去 -->
<script setup lang="ts">
import {
  XhButton,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhDialogRoot
    v-slot="{ setOpen }"
    role="alertdialog"
    :close-on-escape="false"
    :close-on-interact-outside="false"
  >
    <XhDialogTrigger>删除这台设备</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>删除后不可恢复</XhDialogTitle>
      <XhDialogDescription>
        设备上的离线数据会一并清除，请确认这是你要的结果。
      </XhDialogDescription>
      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <XhButton variant="outline" @click="setOpen(false)">再想想</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">确认删除</XhButton>
      </div>
    </XhDialogContent>
  </XhDialogRoot>
</template>
`;export{n as default};
