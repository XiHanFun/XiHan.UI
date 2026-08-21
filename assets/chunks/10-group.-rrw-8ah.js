const n=`<!-- 按钮组 | 相邻两段共用一条边，圆角只留在两端；档位与形状写在容器上，靠自定义属性流给组内每一段 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

const views = ["日", "周", "月"];

// 首段留起始两角、末段留结尾两角，中间保持直角；
// 后一段往回挪一个描边宽度，相邻的两条边重合成一条
function segment(index: number, total: number, radius = "var(--xh-shape-control)") {
  return {
    marginInlineStart: index ? "calc(-1 * var(--xh-stroke-thin))" : undefined,
    borderStartStartRadius: index === 0 ? radius : undefined,
    borderEndStartRadius: index === 0 ? radius : undefined,
    borderStartEndRadius: index === total - 1 ? radius : undefined,
    borderEndEndRadius: index === total - 1 ? radius : undefined,
  };
}
<\/script>

<template>
  <!-- 圆角槽位在容器上收成 0，组内每段都取得到，两端的圆角再逐段补回来 -->
  <div style="display: inline-flex; --xh-button-radius: 0">
    <XhButton
      v-for="(v, i) in views"
      :key="v"
      variant="outline"
      :style="segment(i, views.length)"
    >
      {{ v }}
    </XhButton>
  </div>

  <!-- 同一份配方换一档：高度、内边距、字号在容器上写一次，两端收成胶囊 -->
  <div
    style="
      display: inline-flex;
      --xh-button-radius: 0;
      --xh-button-h: var(--xh-control-h-sm);
      --xh-button-px: var(--xh-control-px-sm);
      --xh-button-font-size: var(--xh-font-size-sm);
    "
  >
    <XhButton
      v-for="(v, i) in views"
      :key="v"
      variant="outline"
      :style="segment(i, views.length, 'var(--xh-shape-pill)')"
    >
      {{ v }}
    </XhButton>
  </div>
</template>
`;export{n as default};
