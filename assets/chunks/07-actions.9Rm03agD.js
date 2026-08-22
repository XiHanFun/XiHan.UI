const t=`<!-- 浮层里的操作按钮 | 列表下面这排按钮是作者自己的节点，键盘事件在它这一层收口，不再上交给列表 -->
<xh-time-picker id="time-picker-actions" step="15">
  <div data-xh-part="root">
    <label data-xh-part="label">提交时刻</label>
    <div data-xh-part="control">
      <span data-xh-part="input" segment="hour"></span>
      <span>:</span>
      <span data-xh-part="input" segment="minute"></span>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <!-- 面板默认把列横排，改成竖排才放得下下面这一排按钮 -->
      <div data-xh-part="content" style="flex-direction: column; gap: 8px">
        <div style="display: flex">
          <div data-xh-part="column" unit="hour">
            <div data-xh-part="item" value="00"></div>
            <div data-xh-part="item" value="01"></div>
            <div data-xh-part="item" value="02"></div>
            <div data-xh-part="item" value="03"></div>
            <div data-xh-part="item" value="04"></div>
            <div data-xh-part="item" value="05"></div>
            <div data-xh-part="item" value="06"></div>
            <div data-xh-part="item" value="07"></div>
            <div data-xh-part="item" value="08"></div>
            <div data-xh-part="item" value="09"></div>
            <div data-xh-part="item" value="10"></div>
            <div data-xh-part="item" value="11"></div>
            <div data-xh-part="item" value="12"></div>
            <div data-xh-part="item" value="13"></div>
            <div data-xh-part="item" value="14"></div>
            <div data-xh-part="item" value="15"></div>
            <div data-xh-part="item" value="16"></div>
            <div data-xh-part="item" value="17"></div>
            <div data-xh-part="item" value="18"></div>
            <div data-xh-part="item" value="19"></div>
            <div data-xh-part="item" value="20"></div>
            <div data-xh-part="item" value="21"></div>
            <div data-xh-part="item" value="22"></div>
            <div data-xh-part="item" value="23"></div>
          </div>
          <div data-xh-part="column" unit="minute">
            <div data-xh-part="item" value="00"></div>
            <div data-xh-part="item" value="15"></div>
            <div data-xh-part="item" value="30"></div>
            <div data-xh-part="item" value="45"></div>
          </div>
        </div>

        <div id="time-picker-actions-row" style="display: flex; justify-content: flex-end; gap: 8px">
          <xh-button size="sm" variant="ghost">
            <button data-xh-part="root" id="time-picker-actions-now">此刻</button>
          </xh-button>
          <xh-button size="sm" variant="ghost">
            <button data-xh-part="root" id="time-picker-actions-clear">清空</button>
          </xh-button>
          <xh-button size="sm">
            <button data-xh-part="root" id="time-picker-actions-ok">确定</button>
          </xh-button>
        </div>
      </div>
    </div>
  </div>
</xh-time-picker>

<span style="font-size: 13px">当前值：<span id="time-picker-actions-value">（空）</span></span>

<script type="module">
  const picker = document.getElementById("time-picker-actions");
  const readout = document.getElementById("time-picker-actions-value");

  // 键盘事件在这一排收口，不再上交给列表
  document
    .getElementById("time-picker-actions-row")
    .addEventListener("keydown", (event) => event.stopPropagation());

  // 值与开合都由宿主持有，写回元素才生效
  function setValue(next) {
    picker.value = next;
    readout.textContent = next || "（空）";
  }

  function setOpen(next) {
    picker.open = next;
  }

  setValue("");
  setOpen(false);
  picker.addEventListener("value-change", (event) => setValue(event.detail.value));
  picker.addEventListener("open-change", (event) => setOpen(event.detail.open));

  // 此刻的时分，两位补零
  document.getElementById("time-picker-actions-now").addEventListener("click", () => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    setValue(\`\${hour}:\${minute}\`);
  });

  document
    .getElementById("time-picker-actions-clear")
    .addEventListener("click", () => setValue(""));

  document
    .getElementById("time-picker-actions-ok")
    .addEventListener("click", () => setOpen(false));
<\/script>
`;export{t as default};
