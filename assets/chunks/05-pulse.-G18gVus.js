const a=`<!-- 呼吸 | pulse 让圆点呼吸，表达正在进行、给不出进度的状态；状态仍要写在文字里，减弱动效下圆点停在满亮 -->
<div style="display: flex; align-items: center; gap: 24px">
  <xh-badge dot pulse tone="danger" label="录制中">
    <span data-xh-part="root">
      <xh-button variant="outline"><button data-xh-part="root">录制中</button></xh-button>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <xh-badge dot pulse tone="success" placement="bottom-end" label="通话中">
    <span data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>
</div>
`;export{a as default};
