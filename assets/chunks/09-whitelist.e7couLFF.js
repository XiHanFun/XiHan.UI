const e=`<!-- 可选值白名单 | 值交给宿主持有，写回来的时间被吸附到清单里的一格，上下键与数字键因此都落在清单上 -->
<div style="display: grid; gap: 8px; justify-items: start">
  <!-- 受控写法：值不交给组件自己存，写入意图先过一遍 snap -->
  <xh-time-field id="time-field-whitelist" value="08:00">
    <div data-xh-part="root">
      <label data-xh-part="label">发车时刻</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <span style="font-size: 13px">
    只收 08:00 / 12:00 / 18:00，当前值：<span id="time-field-whitelist-readout">08:00</span>
  </span>
</div>

<script type="module">
  const field = document.getElementById("time-field-whitelist");
  const readout = document.getElementById("time-field-whitelist-readout");
  const allowed = ["08:00", "12:00", "18:00"];
  let value = allowed[0];

  // 比原值大就取清单里的下一格，比原值小就取上一格，走到头回绕
  function snap(next) {
    if (next === "" || allowed.includes(next)) return next;
    const forward = next > value;
    const hit = forward
      ? allowed.find((t) => t > next)
      : [...allowed].reverse().find((t) => t < next);
    return hit ?? (forward ? allowed[0] : allowed[allowed.length - 1]);
  }

  field.addEventListener("value-change", (event) => {
    value = snap(event.detail.value);
    field.value = value;
    readout.textContent = value || "（空）";
  });
<\/script>
`;export{e as default};
