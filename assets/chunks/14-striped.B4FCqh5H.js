var e=`<!-- 条纹 | striped 在填充上铺一层斜纹，进行中沿行向流动，完成后静止；减弱动效下不流动 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-progress value="45" striped aria-label="导出进度">
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
  <xh-progress value="100" striped tone="success" aria-label="已完成的导出">
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
</div>
`;export{e as default};