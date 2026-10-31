# 第四门主体与剩余范围

2026-10-31。八语第四门已生成独立的标准 ModuleProgram，当前范围为原始章头
至 `scenario4.ks:*select_maid` 之前，中文9个场景、1511个段落边界、1509个实际
正文片段。英文1512/1516；意大利语原文只有8个标题，其余语言9个，未增造
标题或强行按行号对齐。这里不是完整第四门，也未跳过 search 接入正式主线。

源码/宏/PO→既有 lowerDoor→SDK 编译器；没有新的剧情解释器、实例渲染器，
不执行 TJS。与第三门共用章节编译/驱动和游戏视图；独立 gameId/series/DB
保护正式三门旧档。当前正式主线仍停于 search 调查入口。

新增行为：

- `history output=false` 经源说话人宏的已校验最终策略，编译成公开
  richPage(recordHistory=false)。正文推进、已读和窗口确认保留，仅抑制录史。
- 420/440 两种顶部边距生成正式 text.window.geometry，覆盖窄文本框及冷恢复。
- 九处 rceil/gceil/bceil 原图色阶使用 SDK channelCeil，alpha保留；不保存九张
  变色图。它是有限 gamma=1/floor=0 校正，不冒充通用 gamma/shader。
- 新转场宏只展开静态标签，未知指令仍失败。reset_speaker 只接受原宏两个
  固定元数据写入；支持集始终重绘姓名。韩文一处多余引号仅按单个标签摘要
  识别其未使用标志，原txt未改，并显式列 SOURCE_UNUSED_MALFORMED_ATTRIBUTE。

实际命令及结果：

- `pnpm chapters:convert door4`：八语整理 PO，模糊/缺译为0；全部章节控制
  校验总计87898条通过。原KS/TJS保持ignored。
- `pnpm door4:build zh`，其余七语同 compileChapterDoor(locale,'door4') 参数：
  八语成功，中文42函数/2模块/146资源，原字体子集检查通过。
- `pnpm door4:verify zh`、`pnpm door4:verify en`：生产Core完整遍历当前范围，
  2638/2503轮，1509/1516正文片段逐项核对；开头、中段、窄框、校色、终点
  五个真实备份切点 wire及冷模块恢复，最大29对象/38任务。71次媒体回报是
  显式虚拟Host，真实媒体播放与浏览器测试分别计。
- `pnpm test:door4`：9项通过。真实开场；Canvas/WebGL各恢复中段/窄框/校色，
  IndexedDB图文快存与刷新、逻辑正文/栈/舞台/窗口几何一致，真实资源峰值
  不超过64MiB；1.5字号下切点窗口无滚动。对比排除新会话historyId；通过
  暂停加载固定动画时间，再验证原elapsed，而不是忽略变化的文本时钟。
- 同一浏览器任务逐页排版核查英文1509/中文1508个唯一正文单元，共3017页，
  失败0；各仅1页缩排，最小因子0.98560/0.97705。其他六语本次是编译/字体/
  控制检查，没有冒充同样的逐页浏览器验收。
- `pnpm check`；7项Python与`FATA_TEST_LOCALE=zh pnpm exec tsx --test --test-concurrency=1 tests/*.test.ts`
  的103项TS通过。该选项只缩到中文完整第一门，序章/旧版映射等仍跑各自
  声明的语言集；不称八语完整第一门都在本轮重跑。

运行：已有原资料/基线/冻结兼容来源，执行 `pnpm door4:build zh`、
`pnpm door4:verify zh`、`pnpm dev:door4`，访问
`http://127.0.0.1:4190/?lang=zh`。`&cut=start`明确从章头开始。浏览器回归还使用
ignored cuts；正式游戏视图没有实验说明/诊断内容。线上未部署、资源未上传。

剩余：select_maid 开始的后段选择链、memory2条件/结局、原音频flags[0]分支，
以及三门→search调查循环→四门的正式接续。history-only 的 hisout/hisname
注记尚未显示，日/韩首行游标偏移、原动画glyph仍列未认证，不静默声称还原。
原作逐像素/移动真机/通关变体/tft兼容没有完成。

SDK实际依赖SHA-256：
b2be6c7a07bb73709104942e4a5aec73873bf05855828f04a5f7f57db0db8f16，
源码ac545a49c0c76b3a078b2e528f9469eaaafa50bb。SDK自身check、422全量单元、
8相关设备测试、独立tarball通过；模块注册修复另验10专项及模块实包冷恢复。
