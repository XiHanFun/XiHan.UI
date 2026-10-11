var e=`<!-- 预设一览 | 十七个内置预设，进场一族从不在场进入，注意一族原地提醒；播完都回到静息态 -->
<div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
  <div
    style="
      display: grid;
      place-items: center;
      min-height: 140px;
      border: var(--xh-stroke-thin) dashed var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
    "
  >
    <div
      id="animations-presets-card"
      style="
        padding: var(--xh-space-4) var(--xh-space-6);
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-brand);
        color: var(--xh-fg-on-brand);
        font-weight: var(--xh-font-weight-semibold);
      "
    >
      点下面的名字
    </div>
  </div>

  <div>
    <p style="margin: 0 0 var(--xh-space-2); font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">进场</p>
    <div id="animations-presets-enter" style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)"></div>
  </div>

  <div>
    <p style="margin: 0 0 var(--xh-space-2); font-size: var(--xh-text-caption-size); color: var(--xh-fg-muted)">注意</p>
    <div id="animations-presets-attention" style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)"></div>
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