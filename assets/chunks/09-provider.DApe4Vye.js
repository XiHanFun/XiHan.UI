const t=`<!-- 提示组 | XhTooltipProvider 把一排提示放进同一组：没写延时的取组的缺省，组里另一个开着时指向下一个直接接替，同一时刻只开一个 -->
<xh-tooltip-provider open-delay="400" skip-delay-duration="500">
  <div style="display: flex; gap: 8px">
    <xh-tooltip>
      <button data-xh-part="trigger">加粗</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">加粗（Ctrl+B）</div>
      </div>
    </xh-tooltip>
    <xh-tooltip>
      <button data-xh-part="trigger">斜体</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">斜体（Ctrl+I）</div>
      </div>
    </xh-tooltip>
    <xh-tooltip>
      <button data-xh-part="trigger">下划线</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">下划线（Ctrl+U）</div>
      </div>
    </xh-tooltip>
  </div>
</xh-tooltip-provider>
`;export{t as default};
