# 后续复刻差异证据清点（2026-11-05）

本次核对15组组件×8语言的120份编译报告，逐份验证release匹配其实际模块清单。
无缺失或过期报告。结果是转换器声明的清点，不是全作品原作画面对照；同一
事项跨语言/分支多次出现，出现次数不等于独立问题数。原始JSON留在ignored
artifacts/replica-issues/current.json，命令为pnpm exec tsx tooling/audit-replica-issues.ts。

|待关闭项|报告出现次数|下一步|
|---|---:|---|
|NATIVE_GLYPH_NOT_CERTIFIED|192|F-03：需实现原确认图标/动画。|
|HISTORY_ANNOTATION_NOT_RENDERED|39|F-05：历史独立注释原语与源映射。|
|SOURCE_LOOP_SMOOTH_UNCERTIFIED|24|F-04：长音轨精确seek/Smooth认证。|
|SOURCE_ABSOLUTE_TEXT_CURSOR_MAPPING|16|多行独立定位文字；不能只用下一窗口纵向位置替代。|
|SCRIPT_SKIP_CANCEL_NOT_CERTIFIED|8|F-02：脚本强制取消Auto/Skip与手动揭示策略。|
|TRAIL_RASTERIZATION_NOT_PIXEL_CERTIFIED|8|通关第三门仍声明旧长残像采样；需切到SDK实时accumulate并复验。|
|FIRST_LINE_CURSOR_OFFSET_NOT_CERTIFIED|6|CJK首行65px游标偏移。|
|CHOICE_INLINE_ACCENT_NOT_CERTIFIED|4|意大利语混合字号选项。|
|NATIVE_RUBY_METRICS_NOT_CERTIFIED|1|后台ruby的8px/-2px参数实测。|

特别记录：postclear-third使用compileChapterDoor的第三门分支，仍报告旧的长
motionblur采样；不能把普通三门已接实时accumulate的证据推广到通关版。通关
前段功能/冷点通过不等于这里已经逐帧还原。当前冻结发布先保留此声明，后续
切换需重新验证程序/素材闭包、既有通关档来源与中途残像刷新，不删除诊断冒充修复。

其他声明包含已按源保留的缺失部件/媒体、不可达标签、常假分支、尾调用与
源拼写强制转换等。它们不是自动需要“修正”的作品错误；应保留源结果及报告。
随机序列/像素舍入/快速输入转场重入也仍需原作对照，不能凭SDK可播放认证。
F-16跨文件书签继承未由本次组件报告覆盖，继续列在REPLICA_GAPS。
