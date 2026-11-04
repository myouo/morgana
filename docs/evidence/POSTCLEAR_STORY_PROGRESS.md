# 通关后正文分支（2026-11-05）

普通版转换器此前将 sf.fataend 固定为未通关。现在增加显式的数据选择参数，
默认仍为原新游戏分支；通关分支保留同一源段落/PO控制身份，不执行TJS。
动态回忆变量继续由SDK表达式判断，不能把 `memory2 && fataend` 一并折成常量。
两种状态与嵌套if/else、非法表达式拒绝的5项相关检查通过。

中文第一门及门后过场已生成并完整运行：2571个文本片段，其中30个soul角色
片段，四个合法切点冷恢复。保留32664条原已读，完成后35220条，源
fataend_scenario1写入通过。人物标签来自实际soul宏，没有修改新游戏的unknown
称呼。它目前是独立片段，尚未接到新游戏/原章节菜单。

实际命令：

```sh
pnpm exec tsx tooling/compile-postclear-first.ts zh
pnpm exec tsx tooling/drive-postclear-first.ts zh
pnpm exec tsx --test tests/postclear-profile.test.ts tests/search-conditions.test.ts tests/prologue-reader.test.ts
```

第三门与完整第四门的中文通关选择已经生成；新片段不假冒旧普通第四门的
不可变兼容来源。第四门仍含原10个菜单与正常/坏结局目标，完整运行认证待做。
序章、第二门/回忆、第一次调查以及全主流程切换仍需继续完成。Departed条件
沿用原Steam宏，不能仅凭第一门标志就声明已取得全部通关再游玩成就。

此轮已另行通过组合版原章节十二入口回归，以及中英奖励序章九条件/全文/
冷恢复回归；池化UI没有替代原动作。完整通关菜单仍是待发布候选。
原界面/演出差异与F-16书签继承仍保留在总清单，不以本段通过宣称整作完成。
