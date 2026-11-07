# 贡献者入口整理

2026-11-07。按用户要求整理项目入口、删除废弃文件并增加 CONTRIBUTING。
本批不改游戏剧情、资源、存档身份、SDK或Worker，不重新部署。

## 调整

- README收敛为游玩、贡献、安装和文档导航；STATUS只保留当前范围与限制。
  新增CONTRIBUTING、开发/测试/工具指南、文档索引和PR模板。
- 根目录51份Playwright配置收敛为一个日常入口。仍有效的专项配置移到
  tests/config，以根目录绝对路径解析测试、产物和webServer cwd。
- 默认浏览器冒烟使用当前主应用4261服务：八语标题、中英原菜单存刷读，
  无旧档切点依赖。正式构建共用真实UI流程，另验证 __test 钩子编译关闭。
  原两门/三门等迁移矩阵继续作为专项配置，日常开发统一pnpm dev/4184。
- package命令从152个收敛到33个；阶段编译/校验工具保留直接tsx入口。
  默认Vite进入整合主线，旧单门需显式FATA_MODULES=0。
- 67份TS测试分为21份unit和46份source。默认test不读原资料；source回归
  明确依赖原脚本、旧发布及生成物，缺少时失败，不静默跳过。
- 删除局部二门4182演示配置/浏览器测试/compile-next-door/drive-next-door，
  删除早期compile-door体积探针、旧seed-awakening、两份重复tsconfig、
  无代码读取的source.example.yaml及过时DOOR2_ACTIVE/NEXT_DIALOGUE指南。
  完整二门夹具保留，移除其中已废弃的局部模式分支。
- 五份早期顶层文档移至evidence，修复相对链接；保留原日期和历史验收事实。
  AGENTS整理为当前约束，不再混放已被后续指令取代的历史发布规则。

## 实际验证

1. `pnpm sdk:build`从锁定bd2cab2重现tarball，完整SHA仍为
   d222adf212da1921716a6b0c35b38d3672137388b0d5d96a40d02793a314e915。
2. 在临时目录仅放Git源码副本、子模块指针与上述实包，独立执行冻结依赖
   安装；无private/public/generated/artifacts或线上凭据。`pnpm check`
   通过全部TS/TSX、286689条章节PO、基础PO及SDK/提交边界；`pnpm test`
   为59通过、0跳过。最终新入口再通过类型检查和10项浏览器测试发现。
   SDK本身的打包在原本干净子模块中执行，临时目录复用验证后的实包。
3. `PATH="$PWD/private/.venv/bin:$PATH" pnpm test:extractor`：7通过。
4. 四份移动后的原资料回归：22通过、0跳过，包含八语32/93页旧档的实际
   text/choice/end迁移、活动淡出、名字格式、后期路由与书签空名称。
5. 原50份专项配置批量`--list --reporter=list`通过；新local配置实际运行，
   修改后的production配置再单独发现10项。配置发现不等于完整运行矩阵。
6. `pnpm test:browser --reporter=line --output artifacts/contributor-cleanup/browser-local`：
   当前主线真实UI10项通过、0跳过，约4.1分钟。完整二门原章头专项1项通过。
   本机旧二门UI目录首次因缺confirmSave失败；从当前PO重生其InterfaceTextCatalog
   后复验通过，章节Program不改，未放宽UI_TEXT_MISSING校验。
7. 以production/frontend-only模式重建前端，11文件与既有dist.production
   逐字节相同，入口SHA仍2715e0e45ceafd8ac1b69ad8cc7dffb097a738d06d92115d37f33823e88b52c7。
   Worker/SDK/实际正式发布版本保持不变。

补充命令：

```sh
pnpm exec tsx --test tests/source/history-name-formats.test.ts tests/source/late-reset-route.test.ts tests/source/save-caption.test.ts tests/source/save-migration.test.ts
pnpm exec playwright test --config tests/config/full-door.config.ts --grep 'native chapter entry executes' --reporter=line --output artifacts/contributor-cleanup/browser-fixture
pnpm exec playwright test --config tests/config/production.config.ts --list --reporter=list
FATA_MODULES=1 FATA_PRODUCTION=1 FATA_FRONTEND_ONLY=1 pnpm exec vite build --outDir artifacts/contributor-cleanup/frontend
git diff --check
node tooling/check-boundaries.mjs
```

日志、旧UI摘要/刷新记录、浏览器证据和前端字节对照在ignored
artifacts/contributor-cleanup。整作从零重建、全部旧来源、全source/章节浏览器
矩阵和原作等价并未因入口整理而重新认证；对应前置与限制在开发/测试指南中
明确列出。较长进度备份等产品差异继续保留。
