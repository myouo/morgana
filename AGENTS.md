# Fata Morgana 独立迁移实验

这是用户明确要求的独立实例，位于galbox-sdk仓库之外。只以实际tarball依赖和公开exports使用SDK；禁止workspace paths、源码别名或访问SDK私有模块。

游戏安装目录只读。原始包、提取内容、游戏文本/素材、存档、生成public、日志/截图/trace/清单/依赖tarball均ignore；只提交转换器、测试、独立应用及简短报告。不要将游戏载荷提交回SDK。

源脚本只作数据解析，不执行TJS/eval，不增加第二套剧情解释器；转换器输出标准Program/protobuf由正式SDK运行。未知指令显式报告，不能静默跳过。有限可玩片段与整作移植、原作对照、原档兼容分别验收。

每次验收记录实际命令与限制。SDK缺口补到SDK自身并重新打包再消费，不在实例复制引擎实现。日志artifacts/，包private/或vendor/。只本地提交，不推送/发布。

用户进一步明确：以KAG/TJS源脚本、宏/资源与项目组织为主线，不逆向exe；尽可能还原原作表现，游戏视图不放实验标题、说明、诊断、SDK工具栏或其他无关内容。开发说明和剩余缺口写文档。技能/home/myo/.codex/skills/kag-krkr2-porting可用于接续分析。

## 用户最新发布约束

本轮用户授权将独立实例推送myouo/morgana，SDK推送myouo/galbox；独立实例删除本地开发提交历史，折叠为一次全新根提交；用户后续要求删除原LICENSE文件/提交。只推本次明确引用，不推旧分支/tag；只允许对已确认的旧LICENSE分支SHA使用明确force-with-lease；远端变化即拒绝。真实游戏原包/解包目录/提取出的KS/TJS与二进制素材全部不得上GitHub，历史也要检查。i18n文字可提交，仅整理后的PO翻译源纳入Git，KS/TJS与解包树保持ignore。

test.morgana.love是本地build的可玩预览；testsdk.morgana.love用于自动化网络/故障/慢网回归。Worker和前端发布目录隔离，共用只按SHA命名的私有R2资产；速度限制仅在测试浏览器CDP中模拟，不加到预览/Worker/R2。登录/原资料/资源/日志永不提交。

## 后续提交规则（用户最新偏好）

首次清理开发历史、折叠新根和移除LICENSE已经完成。此后保留已发布历史，使用正常追加提交和快进推送；不为继续保持单根而反复amend/force-push。除非用户再次明确要求重写历史，不执行强推。其余载荷/凭据保护、只推明确main引用、不推旧分支/tag约束继续有效。
