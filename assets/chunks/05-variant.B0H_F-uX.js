const a=`<!-- 形态 | variant 只改输入行的底色与描边用法，取值、过滤与键盘行为都不变 -->
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-combobox variant="outline" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-combobox>

  <xh-combobox variant="subtle" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-combobox>

  <xh-combobox variant="ghost" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-combobox>
</div>
`;export{a as default};
