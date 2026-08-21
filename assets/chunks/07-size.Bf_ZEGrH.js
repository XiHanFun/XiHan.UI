const n=`<!-- 尺寸 | 每格的边长随 size 换档，不传 size 即默认档 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 20px">
  <xh-pin-input size="sm" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">小</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input size="lg" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">大</label>
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>
</div>
`;export{n as default};
