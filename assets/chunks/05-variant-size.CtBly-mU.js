const t=`<!-- 形态与尺寸 | variant 换触发器的用色方式，size 换直径；缺省档与 lg 同高，悬浮钮起步就比行内按钮大一号 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const box = {
  position: "relative",
  blockSize: "160px",
  inlineSize: "160px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="v in ['solid', 'outline', 'ghost']" :key="v" :style="box">
      <XhFloatButtonRoot style="position: absolute" :variant="v" :offset="12">
        <XhFloatButtonTrigger />
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>

    <div v-for="s in ['sm', 'md']" :key="s" :style="box">
      <XhFloatButtonRoot style="position: absolute" :size="s" :offset="12">
        <XhFloatButtonTrigger />
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>
  </div>
</template>
`;export{t as default};
