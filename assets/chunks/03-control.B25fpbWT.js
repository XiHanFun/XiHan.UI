var e=`<!-- 起停与归零 | 自行编写部件：control 是一个原生按钮，按一下即按当前状态前进一步（开始 / 暂停 / 继续 / 重置） -->
<xh-timer id="timer-control">
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
    <button data-xh-part="control"></button>
  </div>
</xh-timer>

<script type="module">
  // 起停钮的读屏名随动作换，钮上的字归作者写：两边取同一张表，元素换 data-action 时照着换字，
  // 看到的字与读到的名字不会对不上
  const labels = { start: "开始", pause: "暂停", resume: "继续", reset: "重置" };
  const timer = document.getElementById("timer-control");
  const control = timer.querySelector('[data-xh-part="control"]');
  timer.translations = labels;

  const paint = () => {
    const text = labels[control.dataset.action] ?? "";
    if (control.textContent !== text) control.textContent = text;
  };
  new MutationObserver(paint).observe(control, {
    attributes: true,
    attributeFilter: ["data-action"],
  });
  paint();
<\/script>
`;export{e as default};