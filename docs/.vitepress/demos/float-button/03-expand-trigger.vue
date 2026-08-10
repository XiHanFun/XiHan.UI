<!-- 展开方式 | hover 指针进出整个壳就开合，click 点触发器；点这条恒在，触摸与键盘都靠它 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; inline-size: 100%">
    <div
      style="
        position: relative;
        block-size: 240px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p style="margin: 12px; color: var(--xh-fg-muted)">hover：指针移上去就展开</p>
      <XhFloatButtonRoot style="position: absolute" :offset="16" expand-trigger="hover">
        <XhFloatButtonTrigger>＋</XhFloatButtonTrigger>
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>

    <div
      style="
        position: relative;
        block-size: 240px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p style="margin: 12px; color: var(--xh-fg-muted)">click：点一下展开，Escape 收起</p>
      <XhFloatButtonRoot style="position: absolute" :offset="16" expand-trigger="click">
        <XhFloatButtonTrigger>＋</XhFloatButtonTrigger>
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>
  </div>
</template>
