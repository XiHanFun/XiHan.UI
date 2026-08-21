const t=`<!-- 基础用法 | root / input / submit-trigger 三件缺一不可；Enter 提交、Shift+Enter 换行，清空发生在 submit 派发之后 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-composer id="composer-basic">
    <div data-xh-part="root">
      <textarea data-xh-part="input" placeholder="说点什么…" rows="1"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
  <span id="composer-basic-log">（还没发过）</span>
</div>

<script type="module">
  // 提交那一刻的原文回显在下面那行文字里
  const composer = document.getElementById("composer-basic");
  const log = document.getElementById("composer-basic-log");
  composer.addEventListener("submit", (event) => {
    log.textContent = \`提交：\${event.detail.value}\`;
  });
<\/script>
`;export{t as default};
