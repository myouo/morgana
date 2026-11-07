# Repository Guidelines

贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，本地生成与基线限制见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。

## 源与 SDK

这是 SDK 仓库外的独立实例。只通过实际 tarball 和公开 exports 使用 SDK；禁止 workspace paths、源码别名或私有模块。通用 SDK 缺口补在 `galbox/` 子模块中，提交、打包、验收后再消费，实例不复制引擎实现。

游戏安装目录只读。以 KAG/TJS 源脚本、宏、资源和项目组织为依据，不逆向 exe，不执行 TJS/eval，不增加第二套剧情解释器。未知指令或动态语义必须显式报告，不能静默跳过。有限片段、整作移植、原作对照、原档互通分别验收；每次记录实际命令和限制。接续源分析可使用 `/home/myo/.codex/skills/kag-krkr2-porting`。

游戏视图只放原作内容，不放实验标题、诊断、SDK 工具栏或开发说明。

## 提交边界

Git 只保存转换器、应用、测试、配置、简短报告及用户允许的整理后 PO/控制元数据。原包、提取/解包树、KS/TJS、二进制素材/字体、存档、生成站点、日志/截图/trace/清单、SDK tarball、登录与凭据保持 ignored。证据写 `artifacts/`，本机资料写 `private/`，依赖包写 `vendor/`。不将游戏载荷提交到实例或 SDK，提交与历史都要遵守边界。

使用描述性分支名，可用 `docs/`、`fix/`、`feat/`、`chore/`，分支名中不使用 `agent`。

## 发布与历史

用户已授权实例推送 `myouo/morgana`、SDK 推送 `myouo/galbox`。首次清理开发历史、折叠新根和移除 LICENSE 已完成；后续保留已发布历史，正常追加提交与快进推送。未经用户再次明确要求，不 amend/强推或重写历史。只推明确 `main` 引用，不推旧分支/tag；原游戏载荷和凭据永不进入 GitHub。

正式入口 `fata.morgana.love` 使用独立 `fata-morgana` Worker、production 环境和 `generated/edge-production`，与 Requiem 分开，不修改 Requiem 或主域粉丝站。`test.morgana.love` 仅作测试预览，`testsdk.morgana.love` 为鉴权网络/故障/慢网回归。三站 Worker 和前端目录隔离，共用本作已有私有 SHA R2 资产；正式构建关闭测试导入钩子。限速只在测试浏览器 CDP 模拟，不写入站点/Worker/R2。

浏览器旧存档留在原域；保留测试入口，不强制跳转或宣称自动跨域迁移。
