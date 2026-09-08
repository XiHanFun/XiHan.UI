const t=`<!-- 形态与语气 | variant 换编辑态输入框的底与描边，tone 换聚焦描边与提交钮的色族；预览态不吃这两轴 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-editable variant="outline" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="subtle" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">弱底 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="ghost" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">无壳 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="outline" tone="success" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 成功</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="outline" tone="danger" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 危险</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>
</div>
`;export{t as default};
