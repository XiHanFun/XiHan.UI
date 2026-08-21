const n=`<!-- 自定义配色 | 不写 variant 时底色与文字色取自组件令牌，逐个实例覆盖就能用上语气表以外的颜色 -->
<!-- 静止、悬停、按下三个底色各是一个槽位，缺哪个就落回缺省值 -->
<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #8a2be2;
      --xh-button-bg-hover: #7a24ca;
      --xh-button-bg-active: #691fac;
      --xh-button-fg: #ffffff;
    "
  >
    葡萄
  </button>
</xh-button>

<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #ff69b4;
      --xh-button-bg-hover: #f2559f;
      --xh-button-bg-active: #d94489;
      --xh-button-fg: #ffffff;
    "
  >
    火烈鸟
  </button>
</xh-button>

<!-- 颜色以外的槽位可以一起换，这里再换掉圆角 -->
<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #8a2be2;
      --xh-button-bg-hover: #7a24ca;
      --xh-button-bg-active: #691fac;
      --xh-button-fg: #ffffff;
      --xh-button-radius: var(--xh-shape-pill);
    "
  >
    胶囊葡萄
  </button>
</xh-button>
`;export{n as default};
