---
name: create-android-scaffold
description: >-
  根据 SiteAudit 已整理的 Android 脚手架创建新项目，保留空白首页、完整设置页、
  PDF 同款评分弹窗、SPTool、多语言、独立签名及构建配置。
  适用于用户手动调用后提出“创建 Android 脚手架”“空白首页加设置页”“创建新项目”的任务。
disable-model-invocation: true
---

# 创建 Android 空白脚手架

只能手动调用。用户主动调用 $create-android-scaffold 后执行，普通消息中的触发词用于描述任务范围。

## 确定新项目

从当前请求和已确认上下文读取目标目录、应用名称和 applicationId。缺少这些身份信息时再询问。
用户指定的源工程、分支和功能优先于这里的默认值。

默认完成状态为空白首页和设置入口，加完整设置页及二级页面。保留语言、暗黑模式、反馈及截图预览、关于我们、隐私、服务条款、评分和开发者其他应用入口。

默认不带广告、订阅、Google 登录、云备份、启动页和源应用业务功能。

## 选择脚手架

已完成的基线是私有仓库 https://github.com/jinxedtw/SiteAudit.git 的 main。
本机默认位置为 ~/StudioProjects/SiteAudit，原始初始化提交为 499fb92。这个提交用于追溯，后续创建项目应先检查当前 main 的内容。

此基线起源于 AutoClick 的 main，已经包含本次确认的模块收拢和配置修正。
AutoClick 本机默认位置为 ~/StudioProjects/AutoClick。PDF 本机默认位置为 ~/StudioProjects/PDF。

- 优先使用 SiteAudit 的已整理基线，检查本地与远端分支后，从确认的提交导出到目标目录。
- 从源仓库导出提交文件，避免把工作区未提交改动、.git、构建目录、IDE 配置和原签名复制成新项目。
- 目标目录已有文件时先检查，保留已有工作，防止导出时覆盖。
- 用户明确指定 AutoClick main 时，从该分支提取并应用以下收拢规则。AutoClick 可能当前检出 free，不能直接复制当前工作区。
- 源项目不可用时报告具体访问问题，并使用现有可用源码继续。不得用记忆宣称源码已同步。

## 目录与初始化

保留基线的 BaseActivity、EmptyActivity、ToolBarActivity、适配器基类和 AppConfig 的 Build、Link 结构。
继承链为 BaseActivity → MultilingualActivity → AppCompatActivity。

- 业务仅保留 app 模块和负责构建配置的 buildSrc。工具代码放进 app。
- 扩展函数和 SPTool 放在应用包下的 ext/，普通工具类放在 util/。
- 多语言放在 base/multilingual/，使用 MultilingualManager、MultilingualActivity 和嵌套的 MultilingualConstants。
- 多语言和 SPTool 的实现参考 PDF 工程，读取当前源码后适配包名。保留基线已有的语言上下文缓存、并发读取和 Configuration 变化处理。
- SPTool 直接使用新 Application 的上下文，偏好存储为 app_sp。在 Application 中先赋值上下文，再访问 SPTool 或应用主题。
- 删除独立 util 模块、相应 include 和 project 依赖。
- 移除 HelpInitializer、它的 Manifest 注册、旧的 LanguageSetting / LocalizationActivity，以及仅为它引入的 Startup 直接依赖。
- 如果是在旧应用上迁移，保留旧 util_sp/saved_language 到 app_sp/localization_save_language 的迁移。全新应用不需要携带这段历史迁移。
- 移除 BasePopup 依赖和 SafePopupWindow，弹窗使用现有 DialogFragment 实现。

## 设置与评分

保留基线设置页的基本功能和二级页面，移除登录账号卡片及关联的脚本云同步。
语言列表保留基线支持的 14 种语言，设置项和评分文案都要有对应资源。

评分弹窗参考 PDF 当前的 view/popup/RateUsPopup.kt 及 res/layout/popup_rate_us.xml，默认从 SiteAudit 已适配的版本复用。

- 使用底部圆角样式、点赞图、黄色星星、按钮，以及对应的浅色和暗色资源。
- 点 1～3 星进入反馈，4～5 星打开新 applicationId 的 Google Play 页面，底部评分按钮按 5 星处理。
- 点击星星后短暂显示选中状态，再执行跳转。持久化评分选择并阻止重复点击。
- 仅从设置页手动打开。除非用户另行要求，不加入每天自动展示、首页触发或文档阅读后的触发逻辑。
- DialogFragment 要能恢复，关闭或销毁视图时取消待执行回调，避免重复弹出。
- 保留评分内容的滚动容器，横屏和大字体下按钮应可达。

反馈页面继续由用户在邮件客户端确认发送。保留 SENDTO + mailto 的 queries，当前代码需要查询可用邮件应用。
反馈分类如果仍沿用 AutoClick 的脚本、定时任务等术语，在交付中说明，按新业务需要调整。

## 身份、签名与 Firebase

统一替换 applicationId、namespace、源码包及目录、Manifest 组件、XML 自定义控件、ProGuard、测试 runner、BuildConfig 引用和应用名称。
版本默认从 1 / 1.0.0 开始，用户给定版本时使用用户值。

- Gradle wrapper、插件版本、打包插件、APK / AAB 命名方式及 .gitignore 从所选基线继承，产物前缀改为新项目名。
- 签名生成在 app/，文件名由应用名转为小写并去掉空格，例如 Site Audit 对应 siteaudit.jks。
- 每个新项目生成独立密钥，生成随机 16 位字母数字密码。在 AppConfig 中设置 SIGN_PATH、SIGN_PWD、SIGN_ALIAS 和 SIGN_ALIAS_PWD，保持现有 debug / release 签名接法。
- 不额外引入密码读取脚本或其他签名管理流程，不复用源工程的私钥。
- 用户没有独立 Firebase 文件时，按约定暂用 AutoClick 的 app/google-services.json，只替换其中的包名。交付时明确仍复用源 Firebase 应用标识，需要后续替换正式文件。
- GP_URL 从新 APP_ID 生成。隐私、条款、反馈邮箱、官网、开发者其他应用链接和图标按用户提供内容配置。暂用源资源时明确列出。
- 新项目不得残留源包名、源 applicationId、旧签名路径、假邮箱，以及未使用的 AutoClick 无障碍服务名称和说明。

## Manifest 与方向适配

首页直接作为 launcher。保持仅需要的组件和权限。

移除固定 screenOrientation="portrait"、代码层方向锁和禁止调整窗口的旧配置。
对 Android 平台规则或 Play 当前要求作结论时查阅官方文档，区分系统忽略方向锁与 Play 的设备过滤行为。

关于页和评分弹窗支持滚动。横竖屏切换后反馈文字、截图、问题选择和语言状态应恢复。
检查最终合并后的 Manifest 和产物，避免仅修改主 Manifest 却遗漏依赖带来的组件。

## 验证与交付

- 检查应用名、包名、SDK、版本、签名文件、alias、密码、Firebase 包名、launcher、语言资源、移除模块和库的残留。
- 构建 Debug APK、Release APK 或 AAB，至少验证 Release 混淆和签名。
- 执行适当的 Lint 检查。修复配置错误、缺失翻译和明确的无效资源属性。
- 如果 utilcodex 的未调用 NotificationUtils 触发 NotificationPermission 误报，先确认应用无通知功能，再对该 Manifest 位置定点忽略并注明原因。不能为消除误报增加通知权限或关闭整个 Lint。
- 保留现有未使用资源、旧 API 等非阻断警告的准确说明。不要将 Lint 工具异常描述为完整检查通过。
- 有设备时验证冷启动、设置导航、语言切换与重启、暗黑模式、评分低星反馈和高星商店跳转，以及横竖屏状态恢复。恢复测试中修改的设备设置，报告实际验证范围。
- 构建、等待结束和改动源码按依赖顺序执行。同一项目的不同 Gradle 构建不得并发写入输出目录。
- 交付说明完成的结构、产物路径、验证结果，以及仍暂用的 Firebase、图标、政策链接、邮箱和反馈分类。
- 当前任务如果另行要求创建 GitHub 私有仓库并推送，再执行并核对仓库私有状态、远端提交与本地一致。创建脚手架本身不默认授权外部发布。
