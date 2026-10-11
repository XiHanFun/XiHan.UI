var e=`<!-- 总开关放进 legend | 按 HTML 规范，首个 legend 中的控件不受 fieldset[disabled] 连带影响，总开关因此始终可点击 -->
<xh-fieldset id="fieldset-backup" disabled>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">
      <xh-checkbox id="fieldset-backup-toggle">
        <label data-xh-part="label">
          <button data-xh-part="root">
            <span data-xh-part="indicator"></span>
          </button>
          <span data-xh-part="text">启用自动备份</span>
        </label>
      </xh-checkbox>
    </legend>
    <xh-select default-value="daily">
      <div data-xh-part="root">
        <span data-xh-part="label">备份频率</span>
        <div data-xh-part="control">
          <button data-xh-part="trigger">
            <span data-xh-part="value-text"></span>
            <span data-xh-part="indicator"></span>
          </button>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="list">
              <div data-xh-part="item" value="daily">
                <span data-xh-part="item-text">每天</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="item" value="weekly">
                <span data-xh-part="item-text">每周</span>
                <span data-xh-part="item-indicator"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xh-select>
    <xh-checkbox>
      <label data-xh-part="label">
        <button data-xh-part="root">
          <span data-xh-part="indicator"></span>
        </button>
        <span data-xh-part="text">失败时发通知</span>
      </label>
    </xh-checkbox>
    <p data-xh-part="description">关掉总开关，下面两项跟着停用，唯独总开关自己还能点</p>
  </fieldset>
</xh-fieldset>

<script type="module">
  const backup = document.getElementById("fieldset-backup");
  const toggle = document.getElementById("fieldset-backup-toggle");
  toggle.addEventListener("checked-change", (event) => {
    backup.disabled = event.detail.checked !== true;
  });
<\/script>
`;export{e as default};