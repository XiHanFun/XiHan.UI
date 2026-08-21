const n=`<!-- 暂停、继续与到点 | active 翻假即停在当前剩余量，翻真从那里接着走；改 value 就是重新计时，到点派一次 finish -->
<xh-countdown id="countdown-control" value="5000" precision="1" format="s.S">
  <span data-xh-part="root"></span>
</xh-countdown>
<span> 秒</span>

<xh-button variant="outline">
  <button data-xh-part="root" id="countdown-control-toggle">暂停</button>
</xh-button>

<xh-button variant="solid">
  <button data-xh-part="root" id="countdown-control-restart">
    重新计时（5 秒 / 8 秒 交替）
  </button>
</xh-button>

<span id="countdown-control-done" style="display: none">到点了</span>

<script type="module">
  // 两个时长交替：value 变了才重新计时，同一个值再写一遍不算换了一轮
  const rounds = [5000, 8000];
  const countdown = document.getElementById("countdown-control");
  const toggle = document.getElementById("countdown-control-toggle");
  const done = document.getElementById("countdown-control-done");
  let at = 0;
  let running = true;

  countdown.addEventListener("finish", () => {
    done.style.display = "";
  });

  toggle.addEventListener("click", () => {
    running = !running;
    countdown.active = running;
    toggle.textContent = running ? "暂停" : "继续";
  });

  document
    .getElementById("countdown-control-restart")
    .addEventListener("click", () => {
      at = (at + 1) % rounds.length;
      countdown.value = rounds[at];
      done.style.display = "none";
      running = true;
      countdown.active = true;
      toggle.textContent = "暂停";
    });
<\/script>
`;export{n as default};
