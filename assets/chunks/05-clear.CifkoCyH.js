const t=`<!-- 框里的附加按钮 | root 里除输入与发送外还能放自己的节点；值的读写归宿主，清空这类操作就在框内完成 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-composer id="composer-clear">
    <div data-xh-part="root">
      <xh-button variant="ghost" size="sm">
        <button data-xh-part="root">附件</button>
      </xh-button>
      <textarea data-xh-part="input" placeholder="说点什么…" rows="1"></textarea>
      <!-- 有内容才给清空，清空后按钮自己转灰 -->
      <xh-button id="composer-clear-btn" variant="ghost" size="sm">
        <button data-xh-part="root">清空</button>
      </xh-button>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
  <span id="composer-clear-log">（还没发过）</span>
</div>

<script type="module">
  // 值受控：每次变化写回宿主，清空按钮只是写一个空串
  const composer = document.getElementById("composer-clear");
  const clear = document.getElementById("composer-clear-btn");
  const log = document.getElementById("composer-clear-log");

  function setValue(next) {
    composer.value = next;
    clear.toggleAttribute("disabled", next === "");
  }

  composer.addEventListener("value-change", (event) => setValue(event.detail.value));
  clear.addEventListener("click", () => setValue(""));
  composer.addEventListener("submit", (event) => {
    log.textContent = \`提交：\${event.detail.value}\`;
  });

  setValue("这一台在输入框两侧各放了一颗自己的按钮");
<\/script>
`;export{t as default};
