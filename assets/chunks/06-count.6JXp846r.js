const n=`<!-- 字数与上限 | 原生属性直接落到输入框上（maxlength 定上限），字数由宿主拿当前值现算 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-composer id="composer-count">
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        maxlength="40"
        placeholder="最多 40 个字"
        rows="1"
      ></textarea>
      <span style="font-size: 13px; white-space: nowrap">
        <span id="composer-count-value">0</span> / 40
      </span>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
</div>

<script type="module">
  // 字数跟着当前值走
  const composer = document.getElementById("composer-count");
  const readout = document.getElementById("composer-count-value");
  composer.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.length;
  });
<\/script>
`;export{n as default};
