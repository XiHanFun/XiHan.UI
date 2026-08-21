const n=`<!-- 竖排与折叠 | orientation 换轴后方向键跟着换，collapsible 的面板在它的分隔条上按 Enter 折叠 -->
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

// 中间那栏可折叠：折叠后带上 data-collapsed，收到 collapsedSize
const panels = [
  { id: "top", min: 10 },
  { id: "middle", min: 10, collapsible: true, collapsedSize: 0 },
  { id: "bottom", min: 10 },
];
<\/script>

<template>
  <XhSplitterRoot
    :panels="panels"
    orientation="vertical"
    style="inline-size: 100%; block-size: 220px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">顶栏：min 10%，不可折叠。</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">
        中间这栏可折叠：焦点落到它下面那条分隔条上按 Enter 折叠，再按一次回到折叠前的尺寸。
      </p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="1" />
    <XhSplitterPanel :index="2">
      <p style="padding: 12px">底栏：min 10%。</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
`;export{n as default};
