# 原通关菜单主流程候选（2026-11-05）

cleared-connected 从已验证的 bonus-connected 组合原画廊、音乐室和附录。
fataend 成立时使用原オープニング3、标题菜单、特典メニュー全て及 Giselle，
六项按钮按 title.ks 原坐标、边距、三帧图与声音连接：章节、结局、画廊、音乐、
附录、返回标题。所有内容仍在同一主 Core，未启动临时回放 Player。

本轮重新核实原入口顺序：selecttitle 的 clearvar **先于** fataend 判断。
MainWindow.clearVariables 只清除普通游戏变量 flags；临时 fromextra 保留，
决定语言版本原定的返回标题/直接回奖励菜单。本候选返回时据此重置附录
问题标志，消费 fromextra，并能再次进入附录；没有把上次九题状态留成死菜单。

中文实际完整进度通过：原通关标题/音乐、六按钮、画廊进入/图片/返回，音乐
播放/停止/返回，附录九次选择至成就与原菜单返回，再次进入三项选择。
原32664条已读全部保留，完成附录后33640条；最大44对象/14任务。
附录主流程切点冷恢复和实际旧 native 第九门存档迁移/冷恢复通过。

中文浏览器从真实终章旧档进入原通关标题，经过画廊/音乐/附录，普通带图
保存和刷新恢复通过；标题、六项菜单、画廊、音乐、附录截图已查看。原素材
和脚本参数用于对照，尚非原 exe 的逐像素认证。各语构建/接续矩阵正在运行。

UICatalog 保持原16屏预算。互斥的位图菜单用标准 ui.show/ui.visible 复用，
保留按钮ID、图、位置、声音、条件和跳转；中文组合后11屏。池化的旧章节菜单
原本禁止存档，普通正文旧档和仍可保存的调查菜单不因此换成别的活动界面。
不增加实例运行时UI解释器，也未放宽SDK预算。

实际命令：

```sh
pnpm cleared:build zh
pnpm cleared:verify zh
FATA_UPGRADE_ROOT=generated/cleared-connected pnpm exec tsx tooling/verify-bonus-upgrades.ts zh
pnpm exec playwright test --config playwright.cleared.config.ts
pnpm check
```

代码及报告与发布状态分开：该候选尚未提升到在线预览。当前在线版本仍为
已验收的普通终章/原章节主流程。通关后scenario1–4/search的额外正文和人物
标签、跨文件书签名继承、其余演出/输入/原档互通仍保留在整作目标中，未宣称
F-06或整作完成。候选结果位于ignored `artifacts/cleared-connected/`。
