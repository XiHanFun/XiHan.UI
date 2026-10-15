var e=`<!-- 多行与自动增高 | input 部件写为 textarea 即多行宿主；autoSize 使高度跟随内容，对象形态固定行数上下限（达到 maxRows 后内部滚动） -->
<div style="display: grid; gap: 16px; inline-size: 320px">
  <xh-text-field id="text-field-multiline" max-length="120" show-count placeholder="说点什么">
    <div data-xh-part="root">
      <label data-xh-part="label">备注（2-6 行自动长高）</label>
      <div data-xh-part="control">
        <textarea data-xh-part="input"></textarea>
      </div>
      <span data-xh-part="count"></span>
    </div>
  </xh-text-field>

  <xh-text-field auto-size placeholder="不设行数界限：随内容长高，到上限后框内滚动">
    <div data-xh-part="root">
      <label data-xh-part="label">随写随长</label>
      <div data-xh-part="control">
        <textarea data-xh-part="input"></textarea>
      </div>
    </div>
  </xh-text-field>
</div>

<script type="module">
  // 行数上下限是对象，只能经 property 交给元素
  const field = document.getElementById("text-field-multiline");
  field.autoSize = { minRows: 2, maxRows: 6 };
<\/script>
`;export{e as default};