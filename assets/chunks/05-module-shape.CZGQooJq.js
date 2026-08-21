const e=`<!-- 码点形状 | square / dot / rounded；三种形状的墨都盖住每个模块的格心，读码器按格心取样 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <!-- 时序图形与校正图形不跟着变形：它们是透视校正的几何基准 -->
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com/components/qr-code" module-shape="square" pixel-size="128">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">square</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com/components/qr-code" module-shape="dot" pixel-size="128">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">dot</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-qr-code value="https://ui.xihanfun.com/components/qr-code" module-shape="rounded" pixel-size="128">
      <svg data-xh-part="root"></svg>
    </xh-qr-code>
    <span style="font-size: 12px">rounded</span>
  </div>
</div>
`;export{e as default};
