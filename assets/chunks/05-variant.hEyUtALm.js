const t=`<!-- 形态 | variant 只改每格的颜色槽位，跳格与粘贴铺开的行为三档一致 -->
<div style="display: flex; flex-wrap: wrap; gap: 20px">
  <xh-pin-input variant="outline" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="subtle" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>

  <xh-pin-input variant="ghost" length="4" placeholder="·">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-pin-input>
</div>
`;export{t as default};
