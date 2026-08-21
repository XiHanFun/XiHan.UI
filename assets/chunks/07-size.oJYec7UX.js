const t=`<!-- 尺寸 | size 只改高度、内边距与字号，标签与清空按钮一起跟着换档；不写就是缺省档 -->
<!-- 固定 outline 形态，只看档位的差别 -->
<xh-text-field variant="outline" size="sm" default-value="小" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">sm</label>
    <div style="display: flex; gap: 4px">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="clear-trigger">✕</button>
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="outline" default-value="缺省" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">缺省</label>
    <div style="display: flex; gap: 4px">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="clear-trigger">✕</button>
    </div>
  </div>
</xh-text-field>

<xh-text-field variant="outline" size="lg" default-value="大" clearable>
  <div data-xh-part="root">
    <label data-xh-part="label">lg</label>
    <div style="display: flex; gap: 4px">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="clear-trigger">✕</button>
    </div>
  </div>
</xh-text-field>
`;export{t as default};
