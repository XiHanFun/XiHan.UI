<!-- 外形与贴边 | shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const shape = ref<"circle" | "square">("circle");
const offset = ref(16);
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div style="display: flex; flex-wrap: wrap; gap: 16px">
      <label style="display: flex; align-items: center; gap: 6px">
        外形
        <select v-model="shape">
          <option value="circle">circle</option>
          <option value="square">square</option>
        </select>
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        贴边
        <input v-model.number="offset" type="range" min="0" max="48" step="4" />
        {{ offset }}px
      </label>
    </div>

    <div
      style="
        position: relative;
        block-size: 260px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 展开的每一条动作与触发器同一副身量，圆角跟着 shape 一起换 -->
      <XhFloatButtonRoot
        style="position: absolute"
        :shape="shape"
        :offset="offset"
        :translations="{ trigger: '更多操作' }"
        default-open
      >
        <XhFloatButtonTrigger>＋</XhFloatButtonTrigger>
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
          <button type="button" title="删除">🗑</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>
  </div>
</template>
