const e=`<!-- 换色 | 颜色不是 props，写两个 CSS 变量即可：条必须比底色深且对比充足，反相码无法扫描 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="COLOR" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">缺省</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <!-- 只换条色，人读文字跟着走 -->
    <xh-bar-code value="COLOR" height="48" style="--xh-bar-code-fg: #1d4ed8">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">深蓝条</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="COLOR" height="48" style="--xh-bar-code-bg: #fff7ed; --xh-bar-code-fg: #431407">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">暖底深棕</span>
  </div>
</div>
`;export{e as default};
