# 按章节推进剧情与回放

2026-10-29。新周目完整序章及第一门八语已通过正式Core完整路径、存档恢复和旧SDK档迁移；原章节菜单/隔离回放已在真实网络验证。英文第一门2478段（2477个p和1个自动结束块），其余语言2478–2481段，各自14–16个源场景，不按行号zip。

主线与回放调用同一prologue/door1函数。章末原sf.scenario1才解锁；回放使用SDK临时存储，退出不写主线head/profile。正文、角色、声音、运动、页复制、转场及粒子均是标准SDK指令。KAG exchange=false复制目的页、同时对齐后存活任务、CJK特殊边距及原自动结束段均有独立验证。详见[evidence/FIRST_DOOR](evidence/FIRST_DOOR.md)。

## 可维护文本与批量命令

`locales/<BCP47>/chapters/prologue/*.po`、`chapters/door1/*.po` 是本次整理的完整章节文本来源，共20959条。中文目录为 `locales/zh-Hans/chapters/`。它们是全部分支研究目录；当前序章读取story.po/prologue.po，第一门读取chapters/door1/*.po，选择读取choices.po，首次初始化保留旧awakening.po的修订。

```
pnpm chapters:convert door1
pnpm chapters:convert prologue
pnpm chapters:convert all --staging
pnpm chapters:check
pnpm chapters:assets door1
```

转换器只读取private/text，复用KAG tokenizer，按原稳定标签关联，保留所有分支文字，不执行TJS。13个主线源范围×8语已批量运行，274289条候选、1391个有界PO。后续章暂存artifacts/chapter-catalogs，避免未审全文混入正式发布。badend/附录等尚不属于这13范围，不声称全作文本齐全。

逐场景PO不超过256KiB，超限按稳定身份hash分片；不按译本行号zip。重复原标签带出现次数；无标签段落用前置稳定标签与序号保留并标记待对齐，不能冒充跨语言同一段。原始控制/参数只在ignored私有sidecar；PO保留顺序标记⟪k:N⟫，catalog.toml给出标签种类、来源语言、控制顺序与msgid摘要。贡献者改msgstr即可；不得删除/调换标记、改变msgctxt/msgid。未知宏/动态文本/脚本进入清单，不静默忽略。

重复转换保留人工修订；来源变化与修订冲突标fuzzy，check拒绝未复核条目。消失项保留obsolete，分片布局变化显式拒绝，防止译文消失。脚本内字符串和宏模板不冒充剧情。第一门中文有47条无法直接与英文稳定标签对应；序章中文45条，须根据锚点/分支和原源核对，不自动猜译文。

## 资源与后续

当前可玩发布闭包910资产/216860148字节，已进行SHA和HTTPS全文/Range验证。原包/解包/KS/TJS/sidecar/素材/生成站点/tarball/日志不进Git。中文原包缺失的布こすれる（音人）按已核验原SE逻辑停槽后继续；缺失项显式记录，不用别的声音代替。

下一章按完整门推进，继续同一有限编译器与原PO控制身份；不另建解释器。第二门之后、通关变体、结局鉴赏、原生tft仍未接通；隐藏文本框需要拆分旧序章已合成的框图并接正式显示状态。高级按需剧情代码模块仍未覆盖本门全部能力，当前Program不代表整作一次加载的最终架构。

完整二门现已具有独立八语Program与回忆双路线，见[完整二门验收](evidence/SECOND_DOOR_FULL.md)。第一门到二门的正式接续/旧档迁移仍待高级模块验收；上述旧提取状态不代表当前正文仍只到前三节。
