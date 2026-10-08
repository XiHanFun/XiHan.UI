var e=`<!-- 预设一览 | 十七个内置预设，进场一族从不在场进入，注意一族原地提醒；播完都回到静息态 -->
<div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
  <div
    style="
      display: grid;
      place-items: center;
      min-height: 140px;
      border: 1px dashed var(--vp-c-divider);
      border-radius: 12px;
    "
  >
    <div
      id="animations-presets-card"
      style="
        padding: 16px 24px;
        border-radius: 10px;
        background: var(--vp-c-brand-1);
        color: #fff;
        font-weight: 600;
      "
    >
      点下面的名字
    </div>
  </div>

  <div>
    <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.7">进场</p>
    <div id="animations-presets-enter" style="display: flex; flex-wrap: wrap; gap: 8px"></div>
  </div>

  <div>
    <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.7">注意</p>
    <div id="animations-presets-attention" style="display: flex; flex-wrap: wrap; gap: 8px"></div>
  </div>
</div>

<script type="module">
  import { BUILTIN_MOTION_NAMES, createMotionPlayer } from "@xihan-ui/animations";

  const motion = createMotionPlayer();
  const card = document.getElementById("animations-presets-card");

  // 预设名单在包里，按钮照它铺，不另抄一份
  function presetButton(name) {
    const button = document.createElement("xh-button");
    button.setAttribute("variant", "outline");
    button.setAttribute("size", "sm");
    button.innerHTML = \`<button data-xh-part="root">\${name}</button>\`;
    button.addEventListener("click", () => {
      card.textContent = name;
      void motion.play(card, name);
    });
    return button;
  }

  document
    .getElementById("animations-presets-enter")
    .append(...BUILTIN_MOTION_NAMES.slice(0, 11).map(presetButton));
  document
    .getElementById("animations-presets-attention")
    .append(...BUILTIN_MOTION_NAMES.slice(11).map(presetButton));
<\/script>
`;export{e as default};