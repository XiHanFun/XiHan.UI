const e=`<!-- 中心 logo | 落位与尺寸由组件给出，该片模块先被底色挖空；放置 logo 后把 level 提到 Q 或 H -->
<script setup lang="ts">
import { XhMatrixCode, XhMatrixCodeLogo } from "@xihan-ui/vue";

const text = "https://ui.xihanfun.com";
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: end; gap: 16px">
    <div style="display: grid; gap: 6px; justify-items: center">
      <!-- 挖掉的那片等于人为污损，L / M 那点纠错余量赔不起 -->
      <XhMatrixCode :value="text" level="Q" :pixel-size="176" label="曦寒 UI 文档站二维码">
        <XhMatrixCodeLogo>
          <!-- 边长不超过整码的 1/5，写 100% 即铺满这块，溢出部分被它自己裁掉 -->
          <rect x="0" y="0" width="100%" height="100%" rx="1" fill="#0f172a" />
          <circle cx="50%" cy="50%" r="28%" fill="#ffffff" />
        </XhMatrixCodeLogo>
      </XhMatrixCode>
      <span style="font-size: 12px">Q 级 + logo</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhMatrixCode :value="text" level="H" module-shape="rounded" eye-shape="rounded" :pixel-size="176" label="曦寒 UI 文档站二维码">
        <XhMatrixCodeLogo>
          <rect x="0" y="0" width="100%" height="100%" rx="1.5" fill="#1d4ed8" />
        </XhMatrixCodeLogo>
      </XhMatrixCode>
      <span style="font-size: 12px">H 级 + 圆角</span>
    </div>
  </div>
</template>
`;export{e as default};
