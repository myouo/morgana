# 全结局奖励序章接入（2026-11-05）

`endinglist.ks` 的奖励入口要求 badend1–7 与 fataend 全部成立。本次将第九项
图层、原三帧按钮和该条件接入同一主 Program；不是临时 SceneReplay。
使用各版原图、message1 边距、500ms 隐藏和 3000ms 离场，正文继续由正式 SDK
执行已验证的完整 `prologue.ks`。

中文按钮为源坐标加边距后的 340,407、120×40，英文为 355,408、102×40。
中/日/韩源返回 title.ks；英/法/意/葡/俄返回 endinglist:*ending_main。后者保留
同一主 Core，清理正文图层后重建原结局列表，也可再次进入序章。返回标题时
恢复标题底图，避免正文初始化的黑底遗留到标题按钮后方。

实际命令：

```sh
pnpm exec tsx tooling/compile-bonus-connected.ts zh
pnpm exec tsx tooling/compile-bonus-connected.ts en
pnpm exec tsx tooling/verify-bonus-connected.ts zh
pnpm exec tsx tooling/verify-bonus-connected.ts en
pnpm exec tsx tooling/verify-bonus-upgrades.ts zh,en
pnpm test:bonus
```

八语已通过共1197段正文、72种入口夹具和24个合法冷恢复切点。中英分别通过
149/150段正文、首/中/末三个合法冷恢复切点；保留原来的
32664/32634 条已读及原解锁值。每语以“分别缺少一个结局”和“全部具备”九种
明确 UI 夹具检查入口条件，第九行与按钮同步显隐。英文另验证正文结束后返回
结局列表并再次进入。这些夹具不等同于一次原生会话中顺序取得全部结局，后者
仍归整体验收。

中英三项浏览器通过：中文从原结局列表进入、图文保存/刷新恢复，中文末段
实际返回标题，英文末段返回结局列表并恢复标题背景。首轮重复导入两份完整
进度触及热根容量限制；最终测试复用同一切点或隔离不同检查，保留完整进度，
没有截断已读或抬高 SDK 存储预算。截图和逐语 release 报告在 ignored
`artifacts/bonus-connected/`。英/法/意/葡/俄均验证回列表后再次进入；中/日/韩
验证原返回标题目标。其余六语入口使用明确的解锁夹具，不代替它们的累计
主线全结局验收。

中英实际 native-connected 第九门存档迁移到新候选并冷恢复通过，原已读和
解锁值保持。来源 manifest、字体与叶映射均保留在候选的兼容目录。

`connected-release.ts` 仅组合标准模块，保留旧来源、字体、书签与元数据引用；
新增字体包含正文与注音并通过原字体覆盖检查。SDK 仍消费实际 tarball，
没有实例端剧情解释器，也没有执行源 TJS。完整通关标题、附录、六页画廊、
音乐室、通关后前四门与调查分支及原档互通仍未完成；该候选尚未发布。

无非空标题标签的跨文件书签会继承原 currentPageName；现有静态映射尚未
覆盖这种继承（F-16），随全通主流程保留状态一并处理。
