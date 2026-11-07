# 参与贡献

欢迎从翻译、复现问题、前端交互或转换器修复开始。当前游玩入口是 [fata.morgana.love](https://fata.morgana.love)；功能范围看 [STATUS](STATUS.md)，待完善项看[差异清单](docs/REPLICA_GAPS.md)。

## 准备开发环境

需要 Git、Node.js ≥22.12 和 `package.json` 中 `packageManager` 指定的 pnpm。本机验证使用 Node 24。命令均在仓库根目录运行；仅做文字修改时，也可以直接编辑 PO 并在 PR 中说明未运行检查。

```sh
git clone --recurse-submodules https://github.com/myouo/morgana.git
cd morgana
# 已 clone 的仓库先执行：git submodule update --init galbox
pnpm sdk:build
pnpm install --frozen-lockfile
pnpm check
pnpm test
```

SDK 不是公开 npm 依赖：`sdk:build` 使用子模块锁定的提交，构建并核对 `vendor/` 中的 tarball，然后才能安装本工程。摘要不符时会明确失败；先核对子模块提交和工作区状态，不用 `sdk:update` 绕过检查。`vendor/` 与构建结果不提交。

以上检查不需要游戏安装、解包目录、存档、Cloudflare 登录或私有旧发布快照。浏览器测试另需 `pnpm exec playwright install chromium` 和相应生成物，见[测试说明](tests/README.md)。

## 选择改动位置

| 目录 | 内容 |
| --- | --- |
| `src/` | 原作界面、输入、显示和网页存档迁移适配 |
| `tooling/` | XP3/KAG 数据读取、PO 校验、Program 转换与验收工具 |
| `locales/` | 八语 PO 翻译源、稳定文本身份和控制契约 |
| `tests/unit/` | 不依赖原资料的单元测试，默认 `pnpm test` |
| `tests/source/` | 依赖原脚本、素材、旧发布或生成物的回归 |
| `tests/config/` | 专项 Playwright 配置；根配置默认测试当前主入口 |
| `deployment/` | 静态前端、私有 R2 与 Worker 协议 |
| `galbox/` | SDK 子模块；本工程只消费它打出的实包 |

解析与转换以本作源脚本、宏、资源和配置为证据；游戏安装目录只读。只解析 TJS 数据，不执行 TJS/`eval`，不逆向 exe，不另写剧情解释器。未知指令、动态目标或无法确认的语义要明确报告，不能静默忽略。

游戏画面保留原作内容。开发诊断、SDK 工具栏、实验标题和说明放在文档或测试工具中。

## 翻译和文案

编辑对应语言的 `msgstr`，保留 `msgctxt`、`msgid`、控制标记的种类/编号/数量/顺序。章节正文中的 `⟪k:N⟫`、序章中的 `{{gb:...}}` 都是执行契约；不要改 `catalog.toml`、`controls.toml` 来让校验通过。具体格式见[翻译指南](locales/README.md)。

```sh
pnpm locales:check
pnpm chapters:check
```

无需重新提取或初始化 PO。不要提交原 KS/TJS，也不要修改 `.pb`。文本修改会影响对应页的 Revision 和发布身份；维护者需重新转换、检查字体和旧档影响后才能发布。

## 前端和转换器

日常基础检查：

```sh
pnpm check
pnpm test
```

修改解析、条件、指令映射或存档迁移时，补能验证行为或失败反例的测试。涉及原作参数的修复，还要记录源文件/标签/宏、语言范围，以及实际运行验证的边界；原脚本和证据载荷留在 ignored 目录。

本地完整游玩需要自行准备同一发行版原资料、生成站点，以及对应测试的旧版本快照。`pnpm dev` 统一运行当前主线；不要从历史章节演示起步。源资料准备、整合基线限制及专项工具见[开发说明](docs/DEVELOPMENT.md)。

浏览器输入/菜单改动应验证受影响的实际流程；存档改动应检查保存、刷新、载入和旧槽保留。静态核验、Core 遍历、真实浏览器、原作行为对照分别记录，不能相互替代。无需为纯文档修改重跑完整游戏矩阵。

## SDK 改动

通用引擎缺口在 SDK 修复并验收，然后从实际 tarball 重新接入。本工程不使用 workspace 路径、源码别名或 SDK 私有模块，也不复制一份引擎实现。

需要更新 SDK 时，先在 `galbox/` 完成并提交源码，再在本工程运行：

```sh
pnpm sdk:update
pnpm check
pnpm test
```

PR 同时说明 SDK 提交、实包摘要和公开 API 的变化，提交子模块指针与依赖锁；tarball 本身保持 ignored。

## 提交与 PR

1. 使用描述性分支名，例如 `fix/save-menu-focus`、`docs/contributor-setup`；分支名中不使用 `agent`。
2. 一个改动解决一个明确问题，说明触发条件、修改后的行为及受影响语言。
3. 列出实际运行的命令与结果；没有原资料或未验证原作时直接说明限制。
4. 提交前运行 `git diff --check` 和 `git diff --cached --stat`，核对暂存内容。

可以提交应用/转换器源码、测试、配置、文档和已整理的 PO。原包、提取/解包树、KS/TJS、图片/音频/字体、存档、生成站点、SDK tarball、日志/截图/trace、登录信息和凭据都不提交；原始证据写 `artifacts/`，本机资料写 `private/`。不要用 `git add -f` 绕过这些边界。

报告问题时提供语言、浏览器/系统、复现步骤、预期与实际行为；可注明章节/标签和已脱敏错误。不要在 Issue/PR 附游戏文件、完整存档或含凭据的日志。

已有发布历史保留，后续正常追加提交与快进推送，不重写历史或强推。线上发布由维护者在对应环境验收后执行；提交 PR 不需要 Cloudflare 账号或线上密码。维护者部署入口见[部署说明](deployment/README.md)。

仓库目前未附 LICENSE，原作内容属于原权利方；不要为原游戏素材或翻译源附加未经确认的授权声明。
