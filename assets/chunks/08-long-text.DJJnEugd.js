const t=`<!-- 长文案 | 提示到了宽度上限就换行，不会拉成一条横线；上限是 content 上的 --xh-tooltip-max-w 槽位 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-tooltip placement="bottom" open-delay="0">
    <button data-xh-part="trigger">缺省上限</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        导出会把当前筛选条件下的全部行写进文件，行数很多时要等上一会儿。
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>

  <xh-tooltip placement="bottom" open-delay="0">
    <button data-xh-part="trigger">放宽到 360px</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content" style="--xh-tooltip-max-w: 360px">
        导出会把当前筛选条件下的全部行写进文件，行数很多时要等上一会儿。
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-tooltip>
</div>
`;export{t as default};
