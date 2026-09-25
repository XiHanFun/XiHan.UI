<!-- 声明极性 | 彩色区块写上 data-xh-ink，域内的描边、淡底、正文与主要动作都改取墨色 -->
<script setup lang="ts">
import { XhButton, XhSwitch, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <section
      data-xh-ink="dark"
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-color-yellow-300)"
    >
      <XhButton>发布</XhButton>
      <XhButton variant="outline">取消</XhButton>
      <XhSwitch default-checked aria-label="通知" />
      <XhTextFieldRoot>
        <XhTextFieldControl><XhTextFieldInput placeholder="搜索成员" aria-label="搜索成员" /></XhTextFieldControl>
      </XhTextFieldRoot>
    </section>
    <section
      data-xh-ink="light"
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-color-indigo-800)"
    >
      <XhButton>发布</XhButton>
      <XhButton variant="outline">取消</XhButton>
      <XhSwitch default-checked aria-label="通知" />
      <XhTextFieldRoot>
        <XhTextFieldControl><XhTextFieldInput placeholder="搜索成员" aria-label="搜索成员" /></XhTextFieldControl>
      </XhTextFieldRoot>
    </section>
  </div>
</template>
