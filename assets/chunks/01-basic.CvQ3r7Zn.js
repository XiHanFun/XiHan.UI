const t=`<!-- 基础用法 | 点触发器展开一组动作，再点一下收起；收起时那组按钮退出 Tab 序列 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";
<\/script>

<template>
  <!-- 定位壳缺省钉在视口一角；示例里改成钉在面板内，省得整页都被它压着 -->
  <div
    style="
      position: relative;
      block-size: 260px;
      inline-size: 100%;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <XhFloatButtonRoot style="position: absolute" :offset="16">
      <XhFloatButtonTrigger />
      <XhFloatButtonList>
        <button type="button" title="编辑">✎</button>
        <button type="button" title="分享">↗</button>
        <button type="button" title="删除">🗑</button>
      </XhFloatButtonList>
    </XhFloatButtonRoot>
  </div>
</template>
`;export{t as default};
