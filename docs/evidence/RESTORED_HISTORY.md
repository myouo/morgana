# 读档历史修复、原快捷栏与章节适配

2026-10-28。用户确认输入来自滚轮/触控板。复现：保存并读取片段结束切点，32条history仍完整，paused=false、wheel=true、wait=null；旧InputController错误要求text等待，拒绝只读历史。现在上滚以现有正文/历史为资格，下滚仍严格要求text/prompt；不选择选项或推进结束状态。标题空会话/菜单/表单/惯性保护保持。

SDK在独立feat/chapter-runtime合并已提交origin/main，保留字符等待/滚轮，同时接入G3-07源绑定包络及具名SE。未覆盖主工作区的未提交修改。合并后check、45文件288单元、音源/字符/滚轮浏览器及真实打包consumer通过；a5248fc的CI run40667194441六任务success、179浏览器分片覆盖。当前包66a32352483263ad1a3971b5cd89cf01c3391b5c866b10ed8cea53d6b7849650。

实例check、3 Python+39 TS、八语UI gettext检查通过；本地完整36浏览器通过，其中头像像素断言和回放拒绝码加强后两项再验通过。新增四条组合：quick、菜单、刷新、ended保存→恢复→原历史内容逐条相等→真实鼠标上滚显示。正文/发布的16份protobuf与先前部署逐字节一致，不以破坏存档兼容修复UI。

原快捷栏来自各语MainWindow的7项定义、PNG尺寸/位置、悬停区；接通设置、历史、存档、读取、自动、快进，状态读Player。手动页使用原save背景，12个策略槽、覆盖expectedRevision/确认、读档等待状态；历史字体随当前正文。中日文触发区较低，显示后保留按钮区域防止移向按钮即消失。第七项隐藏文本框仍禁用：目前边框已烘进舞台图，须先拆分，未用错误的DOM隐藏冒充完整原行为。

章节工作：CharacterParts实现已核对的base分组图片语义（名字前缀、=／空项保持、-清除、短列表尾保持），失败不改先前状态；PortraitAssets原部件合成，lowerPortrait经SDK工厂生成淡入/换表情及保存闭包，浏览器实际图像与IndexedDB中途恢复已验。第一门八语各1005个图像调用、86候选组合、73引用；各1处女中_右体引用未找到，原代码有空图层/离屏回退，当前适配尚未建模。定位/运动/条件流仍待，不称已移植完整char_disp。

SourceAudioLowerer把8种播放/停止/淡入淡出指令降为正式音源/SE缓冲工厂，覆盖重入拒绝、失败不换lane、淡出中停止、源绑定恢复新attempt；seopt/bgmopt/xchgbgm等尚不在支持集。完整章节应统一使用源包络，不能直接接在旧片段遗留的零BGM总线后。

chapter-replay读取原sf.scenario1门槛和完成点，声明普通SDK场景目录；缺少合法章节函数时链接拒绝。合成章节体的真实浏览器验证锁定→完成标记→临时Store回放→关闭后主线frames/wait/profile不变及子Canvas销毁。这是源策略适配证明，原作整章正文与回放菜单仍未接通，F-01E保持in_progress。

线上：preview 571d035e-0b3a-4329-acea-f625ddb61ce7；regression ac0751c4-d2bf-44e1-92b2-3dbee4614554。四条读档历史通过；快捷栏首次因未等待异步读档完成而在5秒UI断言失败，增加与已有资源门槛相同的15秒激活/epoch等待，保留原5秒UI断言，复验通过（34.3秒）。没有扩大原资源超时或隐藏失败。预览52文件4115135字节匿名匹配本地dist；Range和回归401通过。

R2总378对象76170263字节；64个新UI资源5110267字节全部HTTPS摘要通过。314旧对象依据已部署前端引用保留、逐个本地摘要核对，复用此前HTTPS证据。画像/回放probe资源只在测试中，未加入生产发布。raw在ignored artifacts/restore-history、artifacts/chapters及artifacts/remote。

补充复验：快捷栏保存前与读档后同时断言正文aria-label等于实际内容，并查看截图确认文字和原按钮同框。画像像素断言已改为与底色比较，避免纯色画布误通过；锁定回放必须报EXTRAS_LOCKED；缺章体测试提供合法main后明确拒绝EXTRAS_SCENE_ENTRY。这些强化均已通过。
