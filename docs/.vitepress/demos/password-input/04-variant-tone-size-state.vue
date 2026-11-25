<!-- 形态、语气、尺寸与状态 | variant 决定底色与描边的绘制方式（密码框没有实心档），tone 决定使用哪族颜色、与 variant 正交；size 只改变高度、内边距与字号，标签、切换按钮与大写锁定提示一起换档；disabled 连明暗切换一起停止，read-only 只锁定值、明暗照常切换，invalid 只标注不拦截输入 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "lg" },
] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4)">
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-3)">
      <XhPasswordInputRoot v-for="v in variants" :key="v" :variant="v" default-value="hunter2">
        <XhPasswordInputLabel>{{ v }}</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </div>

    <!-- 语气这一行固定 subtle，底色差别不必聚焦即可看到；框里的字不归语气管，语气只落在底色、悬停描边与聚焦描边上，聚焦环恒用同一族色 -->
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-3)">
      <XhPasswordInputRoot
        v-for="t in tones"
        :key="t"
        variant="subtle"
        :tone="t"
        default-value="hunter2"
      >
        <XhPasswordInputLabel>{{ t }}</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--xh-space-3)">
      <XhPasswordInputRoot v-for="s in sizes" :key="s.label" :size="s.size" default-value="hunter2">
        <XhPasswordInputLabel>{{ s.label }}</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-3)">
      <XhPasswordInputRoot default-value="hunter2" disabled>
        <XhPasswordInputLabel>禁用</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot default-value="hunter2" read-only>
        <XhPasswordInputLabel>只读</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>

      <XhPasswordInputRoot default-value="123" invalid>
        <XhPasswordInputLabel>校验失败</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
    </div>
  </div>
</template>
