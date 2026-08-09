<!-- 受控 | value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

const value = ref<string | null>(null);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot v-model:value="value">
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarTrigger value="help">帮助</XhMenubarTrigger>

      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="save">
            <XhMenubarItemText>保存</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarPositioner value="help">
        <XhMenubarContent>
          <XhMenubarItem value="about">
            <XhMenubarItemText>关于</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
      <button type="button" @click="value = 'file'">展开「文件」</button>
      <button type="button" @click="value = 'help'">展开「帮助」</button>
      <button type="button" @click="value = null">全部收起</button>
      <span>当前：{{ value ?? "（都收起）" }}</span>
    </div>
  </div>
</template>
