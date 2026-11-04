# 原画廊与音乐室（2026-11-05）

画廊以 picture.ks、picture2–6.ks 的实际按钮、跳转和点击钩子为依据。104 个
同形 TJS 钩子只静态验证目标，输出标准 SDK UI.wait；不注册/执行 TJS。
原图、前后台页、渐变、长滚动和 Phena 胶片动画由正式 SDK 执行。

八语均已通过六页、45 个缩略入口、104 次切图、前后翻页、每页返回标题和
七个引擎状态冷恢复探针。原画廊不允许普通保存，探针明确不是合法手动槽。
中文浏览器经过六页、首张 CG、16 秒不可跳滚动、实际动画变化与退出清理；
截图已检查，未加入调试标题、工具栏或额外提示。

源差异保留：日文六页的 visible="fakse" 依 MessageLayer.setOptions 的
`visible = +elm.visible` 转换为 false，并显式报告，没有改原文件。Phena
重复 layer 属性沿用原最后值的层0转换、原 animstop 层1无有效停止点报告；
胶片仍有已记录的固定种子/像素舍入差异。三帧按钮含 JPG，按实际解码尺寸
分帧并调整 normal/hover/pressed；未将 JPG 头误当 PNG 尺寸。

音乐室从 others/music.ks、music2/3.ks 追踪到22张歌词位图，共25个源文件。
中文已通过三页/65首/22歌词/25个冷探针，播放、等待点击、原淡出结束、返回
本页与前后翻页均由 SDK 标准指令执行。八语65首/22歌词的独立检查均通过；
中文浏览器验证曲目、歌词、真实媒体任务和返回后停止。各版showpagebreak
的0/1赋值按实际源保留。

UI 复用通过标准 ui.show/ui.visible 实现，保留按钮 ID、图、坐标、声音和
跳转，不增加实例运行时适配器。音量偏好与原4M/64MiB存储/资源预算未放宽。
原音乐图层1有显/隐两种入场状态，转换器保留两个有限分支，以免重入时
错误隐藏原曲目文字。宏库固定初始化和文本辅助定义仅核对数据指纹。

实际命令：

```sh
pnpm gallery:build zh
pnpm gallery:verify zh
pnpm gallery:build en
pnpm gallery:verify en
pnpm exec playwright test --config playwright.gallery.config.ts
pnpm exec tsx tooling/compile-music.ts zh
pnpm exec tsx tooling/drive-music.ts zh
pnpm exec playwright test --config playwright.music.config.ts
```

画廊其余语种已按同一命令分批通过。结果与具体 release 在 ignored
`artifacts/gallery/`、`artifacts/music/`。独立模块之后，中文cleared-connected
原通关标题、六项菜单、附录及这两个模块的组合/浏览器已通过，见
[原通关菜单记录](CLEARED_MENU_PROGRESS.md)。这不等于整作已经完成或这些
奖励已发布。通关后前四门/调查变体、原档互通及其余表现差异
仍在总计划内。
