# 历史文本主包合并（2026-11-05）

本批已发布为preview 8edb1a99-1ecd-41ce-aa87-470fa775de18，最终结果见
HISTORY_RELEASE.md；生成根为generated/history-main。中英普通/通关第四门均已合并：中文
新增664条、英文734条历史专用操作；全作其余内容沿用已发布主包。

mergeHistoryInstructions严格要求同函数集合/布局与原指令顺序，只插入history
操作。保留主包现有64条collect设置、通关分派、五个结局包装器的原调用/返回
地址；不把独立候选较新的包装器地址或128条设置覆盖回来。合并器检查每个
call后的返回地址不变，拒绝正文变化、未声明新增操作、顺序变化或未知差异。
单元反例与首部新注释入口通过。源码/脚本只作数据解析，没有第二套解释器。

历史专用textId随片段命名空间隔离，避免普通/通关提示串用。正文textId保持。
新增源元数据只允许已知旧正文的历史提示更新；选择外观/原自动存档点完整
沿用原主包。全局字体加入注释字符，其他资源/旧样式/全局/UI/布局/音轨缓冲
静态核对不变，不删除旧兼容资源。

实际命令：

- pnpm exec tsx tooling/compile-history-fourth.ts zh,en --cleared
- pnpm exec tsx tooling/compile-history-main.ts zh；同命令en
- pnpm exec tsx tooling/normalize-history-main-metadata.ts generated/history-main zh；同命令en
- pnpm exec tsx tooling/verify-history-main-delta.ts zh；同命令en
- pnpm exec tsx tooling/verify-history-main-upgrades.ts zh；同命令en
- pnpm exec tsx tooling/verify-history-main-handoff.ts zh,en
- pnpm exec tsx tooling/verify-history-main-handoff.ts zh,en --source-only
- pnpm exec playwright test --config playwright.history-main.config.ts
- pnpm exec tsx --test tests/history-merge-guard.test.ts tests/history-annotation-ir.test.ts
- pnpm check

中英静态差异通过：原1045/1055函数及全部旧指令保留，14个函数各自加入历史
文本；无新调用返回别名需求。实际第五门/终章进度从原章节菜单进入普通与
通关第四门，每语4个旧点迁移/冷恢复，正文/调用栈/原历史精确不变，继续后
新注释实际执行。保留15385/15388及32664/32634条原已读。

真实浏览器4项通过：中英×普通/通关，原来源清单/切点走正式注册迁移，核对
原位置和历史、继续读出新注释、显示及图文保存后刷新。通关使用实际累计
全结局最新进度，超过39000条已读及所有进度值完整保留。最初测试将零字速
切点与浏览器20ms偏好比较，正确恢复当前偏好导致断言差异；已在加载前设置
相同测试偏好后完整4项通过，迁移逻辑未放宽。未确认正文的新分支historyId
按SDK语义单独处理，其他内容/揭示/来源/窗口/帧及已确认历史精确比较。

其余六语普通和通关独立转换已完成，主包组合正在顺序执行；法语/意语已生成，
不提前将其他语种标为运行通过。原门槛切点另经原来源SDK完整校验通过。
中英第四门到第五门实际旧门槛接续均已通过（各9次合法选择），39306/39268条
原已读全部保留；媒体为虚拟Host。原始结果在artifacts/history-main。
整作仍未完全认证；源行缓冲、未确认正文、跨段追加/角色重置及字体族差异
继续保留。本批最终已发布，仍未因注释整合通过声称F-05完成。

其他语言收尾：法/意差异与每语4个旧点迁移已通过，日语差异已通过。其他
语言的普通状态使用各自真实第五门进度；缺少该语种累计终章Profile时，通关
入口只借用已记录中文的解锁值，清空已读并明确profileFixture/profileLocale，
不称为该语言完整累计进度。中英完整累计进度由上述实际浏览器单独证明。

八语组合已全部生成，精确差异与每语4个旧点迁移均通过，共32点。中英使用
真实各自累计进度，其余通关解锁夹具范围如上，不扩大证据范围。完整素材闭包
5134对象/1178097269字节，仅新增2个字体对象，旧闭包对象全部保留。八语旧来源
清单逐字节匹配冻结的已发布父版；后续测试读取冻结路径，避免promote后来源漂移。
stage-history-main --promote已启动，最终门槛/上线结果待实际完成再记录。

八语32点与最终门槛已全部通过，stage已promote，2个新字体R2上传完成；完整
资源5134对象/1178097269字节，cuts未入发布树。正在构建前端，发布结果另记
[整合发布](HISTORY_RELEASE.md)，不把准备状态当作已上线。
