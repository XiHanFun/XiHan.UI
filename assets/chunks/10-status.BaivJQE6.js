const t=`<!-- 发送失败的错误态 | 判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报 -->
<div style="width: 100%; display: grid; gap: 8px">
  <xh-composer id="composer-status">
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        aria-invalid="false"
        placeholder="发一条试试"
        rows="1"
      ></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>

  <!-- 节点常挂、靠 hidden 显隐：翻出来的那一刻读屏把原因念出来 -->
  <p
    id="composer-status-reason"
    role="alert"
    hidden
    style="margin: 0; font-size: 13px; color: var(--xh-fg-danger)"
  >
    网络不通，这条没能发出去，再发一次
  </p>
  <span id="composer-status-log">（还没发过）</span>
</div>

<script type="module">
  const composer = document.getElementById("composer-status");
  const root = composer.querySelector('[data-xh-part="root"]');
  const input = composer.querySelector('[data-xh-part="input"]');
  const reason = document.getElementById("composer-status-reason");
  const log = document.getElementById("composer-status-log");
  let attempt = 0;

  composer.addEventListener("submit", (event) => {
    attempt += 1;
    // 头一条故意发不出去，再发一条就成
    const failed = attempt % 2 === 1;
    root.toggleAttribute("data-invalid", failed);
    // 边框换成危险档，覆盖的是公开变量
    root.style.setProperty(
      "--xh-composer-border",
      failed ? "var(--xh-color-danger-500)" : "",
    );
    input.setAttribute("aria-invalid", failed ? "true" : "false");
    if (failed) {
      input.setAttribute("aria-describedby", reason.id);
    } else {
      input.removeAttribute("aria-describedby");
    }
    reason.hidden = !failed;
    log.textContent = failed
      ? \`没发出去：\${event.detail.value}\`
      : \`提交：\${event.detail.value}\`;
  });
<\/script>
`;export{t as default};
