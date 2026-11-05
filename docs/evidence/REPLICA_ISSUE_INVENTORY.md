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


通关第三门独立修补候选：新增显式procedural选项，旧默认产物不改变；
compile-realtime-cleared-third.ts写generated/postclear-third-realtime，报告写
artifacts/realtime-postclear-door3，不覆盖当前已冻结发布树/旧组件证据。
中文编译2885文本片段保持，资源614→219；原TRAIL_RASTERIZATION_NOT_PIXEL_CERTIFIED
改为实时film/accumulate参数说明。完整Core走5494回合/2875段落/2885片段通过，
8个冷点含137ms的raster-film与raster-accumulate，信件/卷动/字体几何也通过；
最大35对象/51任务。媒体回调为虚拟Host，不称原作逐像素认证。

实际命令：pnpm exec tsx tooling/compile-realtime-cleared-third.ts zh；
调用driveChapterDoor('zh','door3',{root:'generated/postclear-third-realtime',
cleared:true,reportPrefix:'realtime-'})；pnpm exec tsc --noEmit。该候选尚未接入
主Program，仍待八语生成、旧通关第三门保存来源映射及真实Canvas/WebGL中途
残像恢复/无派生帧请求验证，再进入后续发布。当前preview部署字节未改变。


独立候选已增加真实浏览器专项playwright.realtime-cleared-third.config.ts：
Canvas/WebGL各film、accumulate共4例通过（25.3秒）。效果137ms阶段图文保存与
刷新后同stage/frames/text/raster任务严格相同，且未请求新旧目录差分中已移除
的图像SHA。实看Canvas残像与WebGL旧电影截图，无额外诊断界面；此检查不等于
原作同帧像素比较。首次检查发现旧generated/site界面文字缺confirmSave，生成器
新增显式uiRoot，独立候选消费当前已验证integrated界面文字；旧默认保持不变，
没有补空翻译或跳过失败。已用当前完整UI文字重跑4例并通过。

八语独立全文/两个raster中途冷点现全部通过（每语8个冷点，文本片段数按各自
源脚本变化）。仍未合并到主Program，下一步是正式来源迁移与组合回归，不能
把独立候选称为线上已修复。


## 稳定锚点的组合候选接续

接主流程时发现先前procedural选项还启用了第三门dynamicGeometry，造成信件后
地址漂移。已从本次修补去掉这项顺带布局变化并重生成/重跑八语全文与8冷点；
新稳定中文源版本door3-zh-97e6d9c749d506bb7746替代此前e6076f版本。中文共
26074个原锚点全部保留，64条变化限定为sequence→raster、停止指令及配套图像/
源滤镜替换；函数布局/条数/顺序和动作时长严格核对。故事textId、锚点或film
时长被篡改的反例拒绝，2项相关测试及check通过。稳定版Canvas/WebGL4效果
保存刷新再次通过（26.6秒），不复用布局曾变更版本的物理浏览器证据。

connectedRelease增加限定前缀替换，普通剧情/菜单不改；主流程新候选写
realtime-cleared-connected，未覆盖已发布integrated。中文组合差异检查通过：
通关第三门以外所有函数及旧资源/窗口/全局/鉴赏/界面契约保持；保留旧资源
目录用于旧状态验证，不宣称整个发布闭包已经减少85MB。

普通版本已有的严格raster升级检查提取为checkRasterFunctions，不改变旧默认
逻辑。新主包为实际含postclear-third代码的两个历史来源分别登记已校验的
图像替换映射，现有正式源清单/代码/快照验证与应用migrateSearch负责迁移；
没有按像素猜状态或执行TJS。中文旧主程序开头/film/短残像/长残像四切点，
迁移后保持正文、4层父调用栈、任务ID/elapsed/duration，随后冷恢复通过。

真实主程序Canvas/WebGL×三种旧效果切点共6浏览器，通过实际源清单及SDK Store
旧槽→注册迁移→当前图文快速保存→刷新读回，得到相同目标stage/正文/父栈/
raster时钟。不是仅测试独立donor或人工预改后的快照。现有普通故事与菜单
未变化的逐指令检查通过；其余七语组合/注册路径验证仍在后台继续。
