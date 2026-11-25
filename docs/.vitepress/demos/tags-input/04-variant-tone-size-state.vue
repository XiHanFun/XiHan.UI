<!-- 形态、语气、尺寸与状态 | variant 只改变控件的颜色槽位，标签形态按控件的面派生（subtle 中是描边标签，其余是淡底标签）；tone 与 variant 正交；size 让控件高度、胶囊与输入文字一起换档；disabled 整个控件退出 Tab 序列、标签一起置灰，read-only 仍可聚焦浏览但不能加入也不能删除、标签不置灰 -->
<script setup lang="ts">
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const columnStyle = "display: flex; flex-direction: column; gap: var(--xh-space-5); max-inline-size: 420px";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-8)">
    <div :style="columnStyle">
      <XhTagsInputRoot
        v-for="v in variants"
        :key="v"
        v-slot="{ value }"
        :variant="v"
        :default-value="['Vue', 'TypeScript']"
        placeholder="回车落一个"
      >
        <XhTagsInputLabel>{{ v }}</XhTagsInputLabel>
        <XhTagsInputControl>
          <XhTagsInputItem v-for="t in value" :key="t" :value="t">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger />
            </XhTagsInputItemPreview>
          </XhTagsInputItem>
          <XhTagsInputInput />
        </XhTagsInputControl>
      </XhTagsInputRoot>
    </div>

    <div style="display: grid; gap: var(--xh-space-4); grid-template-columns: repeat(2, minmax(0, 1fr))">
      <XhTagsInputRoot
        v-for="t in tones"
        :key="t"
        v-slot="{ value }"
        variant="outline"
        :tone="t"
        :default-value="['标签']"
        placeholder="回车落一个"
      >
        <XhTagsInputLabel>{{ t }}</XhTagsInputLabel>
        <XhTagsInputControl>
          <XhTagsInputItem v-for="v in value" :key="v" :value="v">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ v }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger />
            </XhTagsInputItemPreview>
          </XhTagsInputItem>
          <XhTagsInputInput />
        </XhTagsInputControl>
      </XhTagsInputRoot>
    </div>

    <div :style="columnStyle">
      <XhTagsInputRoot
        v-for="s in sizes"
        :key="s.label"
        v-slot="{ value }"
        :size="s.size"
        :default-value="['Vue', 'TypeScript']"
        placeholder="回车落一个"
      >
        <XhTagsInputLabel>{{ s.label }}</XhTagsInputLabel>
        <XhTagsInputControl>
          <XhTagsInputItem v-for="t in value" :key="t" :value="t">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger />
            </XhTagsInputItemPreview>
          </XhTagsInputItem>
          <XhTagsInputInput />
        </XhTagsInputControl>
      </XhTagsInputRoot>
    </div>

    <div :style="columnStyle">
      <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" disabled>
        <XhTagsInputLabel>禁用</XhTagsInputLabel>
        <XhTagsInputControl>
          <XhTagsInputItem v-for="t in value" :key="t" :value="t">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger />
            </XhTagsInputItemPreview>
          </XhTagsInputItem>
          <XhTagsInputInput />
        </XhTagsInputControl>
      </XhTagsInputRoot>

      <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" read-only>
        <XhTagsInputLabel>只读</XhTagsInputLabel>
        <XhTagsInputControl>
          <XhTagsInputItem v-for="t in value" :key="t" :value="t">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger />
            </XhTagsInputItemPreview>
          </XhTagsInputItem>
          <XhTagsInputInput />
        </XhTagsInputControl>
      </XhTagsInputRoot>
    </div>
  </div>
</template>
