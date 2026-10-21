var e=`<!-- 三个尺寸档 | size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注 -->
<div id="timer-sizes">
  <div style="margin-block-end: 12px">
    <xh-timer size="sm" countdown start-ms="60000">
      <div data-xh-part="root">
        <div data-xh-part="display">
          <span data-xh-part="item" unit="minutes"></span>
          <span data-xh-part="separator">:</span>
          <span data-xh-part="item" unit="seconds"></span>
        </div>
        <button data-xh-part="control"></button>
      </div>
    </xh-timer>
  </div>

  <div style="margin-block-end: 12px">
    <xh-timer size="md" countdown start-ms="60000">
      <div data-xh-part="root">
        <div data-xh-part="display">
          <span data-xh-part="item" unit="minutes"></span>
          <span data-xh-part="separator">:</span>
          <span data-xh-part="item" unit="seconds"></span>
        </div>
        <button data-xh-part="control"></button>
      </div>
    </xh-timer>
  </div>

  <div style="margin-block-end: 12px">
    <xh-timer size="lg" countdown start-ms="60000">
      <div data-xh-part="root">
        <div data-xh-part="display">
          <span data-xh-part="item" unit="minutes"></span>
          <span data-xh-part="separator">:</span>
          <span data-xh-part="item" unit="seconds"></span>
        </div>
        <button data-xh-part="control"></button>
      </div>
    </xh-timer>
  </div>
</div>

<script type="module">
  // 起停钮的字归作者写：与读屏名取同一张表，元素换 data-action 时照着换字
  const labels = { start: "开始", pause: "暂停", resume: "继续", reset: "重置" };

  for (const timer of document.getElementById("timer-sizes").querySelectorAll("xh-timer")) {
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
  }
<\/script>
`;export{e as default};