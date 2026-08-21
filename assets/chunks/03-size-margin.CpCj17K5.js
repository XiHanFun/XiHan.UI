const n=`<!-- 边长与静区 | pixelSize 是整块的像素边长；margin 的单位是模块数，静区含在里面不额外占地方 -->
<div style="display: flex; flex-wrap: wrap; align-items: end; gap: 16px">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com" pixel-size="96">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">96px · 静区 4</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com" pixel-size="144">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">144px · 静区 4</span>
  </div>
  <!-- 静区归零后码面顶到边上；印刷或贴在深色底上时四周得自己再留白，否则扫不出来 -->
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com" pixel-size="144" margin="0">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">144px · 静区 0</span>
  </div>
</div>
`;export{n as default};
