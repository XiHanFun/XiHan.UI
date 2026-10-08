var e=`<!-- 撑满行宽 | segmented 形态加 block 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐 -->
<div style="inline-size: 420px">
  <xh-radio-group variant="segmented" block default-value="auto">
    <div data-xh-part="root">
      <span data-xh-part="label">执行方式</span>
      <span data-xh-part="thumb"></span>
      <div data-xh-part="item" value="auto">
        <span data-xh-part="item-text">自动</span>
      </div>
      <div data-xh-part="item" value="manual">
        <span data-xh-part="item-text">手动</span>
      </div>
      <div data-xh-part="item" value="scheduled">
        <span data-xh-part="item-text">按计划执行</span>
      </div>
    </div>
  </xh-radio-group>
</div>
`;export{e as default};