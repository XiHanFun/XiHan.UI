var e=`<!-- 分段 | steps 把轨道切成等宽的格，填充按整格亮起；读屏报的仍是实际值 -->
<div style="width: 100%; display: grid; gap: 8px">
  <xh-progress
    id="progress-steps"
    value="3"
    max="5"
    steps="5"
    value-text="第 3 步，共 5 步"
    aria-label="注册进度"
  >
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-progress>
  <div style="display: flex; gap: 8px">
    <button type="button" id="progress-steps-prev">上一步</button>
    <button type="button" id="progress-steps-next">下一步</button>
  </div>
</div>

<script type="module">
  // 步数与读屏文字一起改
  const progress = document.getElementById("progress-steps");
  let step = 3;

  function set(next) {
    step = Math.min(5, Math.max(0, next));
    progress.setAttribute("value", step);
    progress.setAttribute("value-text", \`第 \${step} 步，共 5 步\`);
  }

  document.getElementById("progress-steps-prev").addEventListener("click", () => set(step - 1));
  document.getElementById("progress-steps-next").addEventListener("click", () => set(step + 1));
<\/script>
`;export{e as default};