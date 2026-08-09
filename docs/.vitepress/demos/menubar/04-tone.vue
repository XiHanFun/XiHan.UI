<!-- 语气 | tone 换的是高亮底色，静止态一样：悬停到 trigger 上、或展开菜单后把焦点移到条目上才显现 -->
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];
</script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 8px; padding-block-end: 160px">
    <div
      v-for="t in tones"
      :key="t.value"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 120px; flex: none">{{ t.label }}</span>
      <XhMenubarRoot :tone="t.value">
        <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
        <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>

        <XhMenubarPositioner value="file">
          <XhMenubarContent>
            <XhMenubarItem value="new">
              <XhMenubarItemText>新建</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="open">
              <XhMenubarItemText>打开</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarSeparator />
            <XhMenubarItem value="save">
              <XhMenubarItemText>保存</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>

        <XhMenubarPositioner value="edit">
          <XhMenubarContent>
            <XhMenubarItem value="undo">
              <XhMenubarItemText>撤销</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="redo">
              <XhMenubarItemText>重做</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>
    </div>
  </div>
</template>
