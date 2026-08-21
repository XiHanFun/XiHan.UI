const e=`<!-- 配文字说明 | 进度条自身只画轨道与进度，百分比文字由使用者摆 -->
<div style="width: 100%; display: grid; gap: 8px">
  <div style="display: flex; justify-content: space-between">
    <span>上传中</span>
    <span id="progress-labelled-text">64%</span>
  </div>
  <xh-progress id="progress-labelled" value="64">
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
  <div style="display: flex; gap: 8px">
    <button type="button" id="progress-labelled-dec">-10</button>
    <button type="button" id="progress-labelled-inc">+10</button>
  </div>
</div>

<script type="module">
  // 进度值与文字由使用者一起改
  const progress = document.getElementById("progress-labelled");
  const text = document.getElementById("progress-labelled-text");
  let value = 64;

  function set(next) {
    value = Math.min(100, Math.max(0, next));
    progress.setAttribute("value", value);
    text.textContent = \`\${value}%\`;
  }

  document
    .getElementById("progress-labelled-dec")
    .addEventListener("click", () => set(value - 10));
  document
    .getElementById("progress-labelled-inc")
    .addEventListener("click", () => set(value + 10));
<\/script>
`;export{e as default};
