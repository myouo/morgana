# 历史内容接续（2026-11-05）

F-05仍未完成，本轮先补真实SDK能力和源语义入口；不将扩大显示条数等同原作
行缓冲，也不把静态注释解析称为已在游戏中显示。线上保持ca5086fd预览。

SDK W1-22/ADR0121已完成：新增可选maxDisplayEntries=1..2048，与原maxEntries
最多64个持久回溯条目分开；默认行为、Snapshot/存储/活动模块预算不变。
467单元、2100次真实Core确认/冷恢复、2048条真实IndexedDB图文保存/刷新、
6个原历史语音/回溯浏览器及隔离实际tarball消费通过。实例已安装同一实包：
SDK来源99ed997bf90bce3e9965a3d1acc74cf7613c285e，SHA256为
a5feda213ab598e73c5413807ca83705dc71172d3796ee144bd0edcb2b400963。
只经公开exports和真实file依赖。新SDK下原中英历史滑块/旧槽迁移2浏览器及
pnpm check通过；未把新包发布到线上，当前应用仍配置64条显示。

新增source-history-profile只静态读取Config/HistoryLayer/system_define/macro。
已锁定三个LF规范化store方法指纹、historyWriteEnabled条件与追加语义；
hisname的字面量拼接、字体/字号及resetfont动作均保留，无TJS/eval执行。
中日版在store时增量换行；韩文及五种西文版store先追加，显示时采用另一套
换行/样式逻辑。中日韩maxLines=2000、其余500，不能统一当作段落数或DOM行数。

实际命令：pnpm sdk:update；pnpm check；pnpm exec tsx --test
tests/source-history-profile.test.ts；pnpm exec tsx tooling/inspect-history-annotations.ts；
pnpm exec playwright test --config playwright.history-scrollbar.config.ts。
八语静态2928个hisout/hisname标签可解析，未支持参数0；韩文唯一源尾随引号仍
明确记录SOURCE_UNUSED_MALFORMED_ATTRIBUTE，未隐藏诊断。静态调用不冒充运行
覆盖。临时结果artifacts/history-annotations/source-plan.json；未提交原文/原素材。

下一步：把注释的条件追加/顺序/样式及当前揭示文本映射为正式SDK历史能力，
再按两类源行缓冲配置state.collect和显示窗口；保留旧档已有历史，不凭已读
标记编造旧程序已裁掉的记录。必须测完整进度下字节/模块闭包和存读档时间，
通过后才替换线上历史内容。已完成的主线与滑块不重复做无关全量验收。
