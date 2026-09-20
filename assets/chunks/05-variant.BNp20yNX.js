const t=`<!-- 形态 | variant 只改变控件的颜色槽位，标签的形态按控件的面派生：subtle 控件中是描边标签，其余是淡底标签；落下标签与删除标签的行为三档一致 -->
<div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
  <xh-tags-input
    variant="outline"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="subtle"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>

  <xh-tags-input
    variant="ghost"
    default-value="Vue,TypeScript"
    placeholder="回车落一个"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <div data-xh-part="item" value="Vue">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">Vue</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <div data-xh-part="item" value="TypeScript">
          <div data-xh-part="item-preview">
            <span data-xh-part="item-text">TypeScript</span>
            <button data-xh-part="item-delete-trigger"></button>
          </div>
        </div>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-tags-input>
</div>
`;export{t as default};
