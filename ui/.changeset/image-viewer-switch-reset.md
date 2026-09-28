---
'@xihan-ui/styles': patch
---

ImageViewer 换图不再当着用户把旧图转回、缩回：取图期间（打开与换下标）图不挂变换过渡、不透明度为 0，换下标那一刻变换直接归位，旧图随即让位给视口里的占位面；新图取到之后按进场档（`--xh-motion-duration-enter` + `--xh-motion-ease-enter`）淡入（此前换图时平移、旋转、缩放补间回初值，然后新图直接露面）。
