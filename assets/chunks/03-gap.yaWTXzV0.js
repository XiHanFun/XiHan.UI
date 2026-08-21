const t=`<!-- 间距档位 | gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，行距与列距同吃这一份 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 8px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
const cells = ["甲", "乙", "丙", "丁", "戊", "己"];
<\/script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem v-for="g in gaps" :key="g">
      <div :style="labelStyle">gap = {{ g }}</div>
      <XhGridRoot :cols="3" :gap="g" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 -->
    <XhGridItem>
      <div :style="labelStyle">槽位覆盖</div>
      <XhGridRoot :cols="3" gap="xs" style="--xh-grid-gap: 32px; margin-block-start: 6px">
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
`;export{t as default};
