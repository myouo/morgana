# 第五门源转换进度（2026-11-01）

2026-11-03更新：八语全文、主线续接、第四页章节回放、原作书签与联合字体
已完成整合并更新可玩预览。135旧切点、40个最终冷恢复切点、13项本地及13项线上浏览器、
119 Node/7 Python通过；法语缺失BGM按原系统停双缓冲后保持静音，不替换
成其他音轨。4项原有公网兼容回归也通过，素材与最终发布信息见
[第五门主线记录](FIFTH_MAINLINE.md)。下文为11月1日的历史阶段记录。

八语 scenario5 已整理为可维护 PO/catalog，KS/TJS 与素材保持 ignored。新增
`pnpm door5:build [zh|all]`、`pnpm door5:verify [zh|all]`，仍输出标准 SDK
ProgramModule/protobuf，没有第二套解释器。

中文整章编译及正式 Core 遍历通过：16 场景、4175 原段落、4190 文本片段、
7052 回合、7 代码模块，338 资产；最大 33 对象/46 任务，没有提高预算。
start、bgm-paused、scroll、middle、ended 五个切点均 protobuf 冷恢复通过，
终点明确为 scenario6.ks:*start。193 次媒体回执来自显式虚拟 Host，不是逐轨
真机播放认证。原 BGM 两个 lane 的 pausebgm/resumebgm 通过 SDK 新的
audio.source.pause 表达；真实 element 位置/其他音效继续/暂停恢复在 SDK
浏览器单独验证。原 flash 默认 count=1 与 440px 窗口边距按源数据支持。

实际命令：`pnpm exec tsx tooling/convert-chapters.ts scenario5`、
`pnpm door5:build zh`、`pnpm door5:verify zh`、`pnpm door5:build all`。
八语批编译在英语通过后显式停于法语缺失 BGM storage="Foule et rivière"；同一
剧情锚点的英/中源为 "Crowd and river"，尚未擅自替换或静默跳过。英语另有
原生 animated glyph 的既有表现限制，见 ignored 编译报告。
第五门尚未接入发布主线、章节回放/书签和共享资产闭包，未上传其资源；线上
连续剧情仍以现有 scenario5 入口为界。下一步处理法语源差异并完成其余语言、
独立设备切点、主线/回放连接和旧档迁移。不能据此声称第五门线上已完成或
原作表现百分百认证。
