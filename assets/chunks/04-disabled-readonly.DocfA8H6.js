const t=`<!-- 禁用与只读 | disabled 整个控件退出 Tab 序列；read-only 仍可聚焦浏览，但加不进也删不掉 -->
<div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
  <xh-tags-input default-value="Vue,Vite" disabled>
    <div data-xh-part="root">
      <label data-xh-part="label">禁用</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="Vite">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vite</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input default-value="Vue,Vite" read-only>
    <div data-xh-part="root">
      <label data-xh-part="label">只读</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="Vite">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vite</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
`;export{t as default};
