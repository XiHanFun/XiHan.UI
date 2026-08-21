const n=`<!-- 成组与溢出计数 | 组内共用的直径、字号、形状在容器上写一次，自定义属性沿继承流给每一枚；超出上限的收成一枚「+N」，它只是又一枚落回退态的头像 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承", "临", "旭"];
const max = 4;

const shown = members.slice(0, max);
const rest = members.length - shown.length;

// 两组只差容器上的这几个槽位，组内的写法完全一样
const groups: { key: string; tokens: Record<string, string> }[] = [
  {
    key: "圆",
    tokens: { "--xh-avatar-size": "36px", "--xh-avatar-font-size": "14px" },
  },
  {
    key: "方",
    tokens: {
      "--xh-avatar-size": "26px",
      "--xh-avatar-font-size": "11px",
      "--xh-avatar-radius": "var(--xh-radius-md)",
    },
  },
];
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <div
      v-for="g in groups"
      :key="g.key"
      :style="{ display: 'flex', alignItems: 'center', ...g.tokens }"
    >
      <!-- 叠放是外层的事：后一枚往回挪一段，再描一圈底色把压住的边分开 -->
      <XhAvatarRoot
        v-for="(m, i) in shown"
        :key="m"
        :style="{ marginInlineStart: i ? '-10px' : '0', outline: '2px solid var(--vp-c-bg)' }"
      >
        <XhAvatarImage />
        <XhAvatarFallback>{{ m }}</XhAvatarFallback>
      </XhAvatarRoot>

      <!-- 计数格没有图，只写回退内容 -->
      <XhAvatarRoot
        v-if="rest > 0"
        style="
          margin-inline-start: -10px;
          outline: 2px solid var(--vp-c-bg);
          --xh-avatar-bg: var(--xh-bg-muted);
          --xh-avatar-fg: var(--xh-fg-muted);
        "
      >
        <XhAvatarFallback>+{{ rest }}</XhAvatarFallback>
      </XhAvatarRoot>
    </div>
  </div>
</template>
`;export{n as default};
