const e=`<!-- Enter 只换行 | submit-on-enter 关掉后 Enter 交回浏览器插入换行，发送只剩按钮一条路 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-composer id="composer-enter" submit-on-enter="false">
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        placeholder="Enter 在这里只换行"
        rows="2"
      ></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
  <span id="composer-enter-log">（还没发过）</span>
</div>

<script type="module">
  // 提交那一刻的原文回显在下面那行文字里
  const composer = document.getElementById("composer-enter");
  const log = document.getElementById("composer-enter-log");
  composer.addEventListener("submit", (event) => {
    log.textContent = \`提交：\${event.detail.value}\`;
  });
<\/script>
`;export{e as default};
