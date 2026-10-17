# Android-Skills

**只存放 Cursor / AI Agent 用的 Skill 文档**，不放工程源码、AAR、密钥或业务项目。

```
Android-Skills/
├── README.md
└── skills/
    └── <skill-name>/
        ├── SKILL.md           # 必选：入口（YAML frontmatter + 主流程）
        └── reference-*.md     # 可选：细节、依赖、踩坑（渐进披露）
```

## 当前 Skills

| 目录 | 用途 |
|------|------|
| [skills/android-reverse-engineering](skills/android-reverse-engineering/SKILL.md) | Android APK / XAPK / JAR / AAR 反编译、接口与调用链分析，以及 Frida / JNI / SO 分析 |
| [skills/integrate-adsdk](skills/integrate-adsdk/SKILL.md) | 宿主 Android 工程接入 / 切换广告聚合（AdMob / MAX / TopOn / TradPlus，adSdk AAR） |
| [skills/complete-pdf-project](skills/complete-pdf-project/SKILL.md) | 以现有 PDF 工程为底板复制新项目：业务照搬、差异化打散、Figma 换 UI、广告走 adSdk |
| [skills/mobile-app-ui-design](skills/mobile-app-ui-design/SKILL.md) | 移动端界面与流程设计 |
| [skills/appllama-app-design-skill](skills/appllama-app-design-skill/SKILL.md) | AppLlama 应用界面设计 |
| [skills/appllama-usage](skills/appllama-usage/SKILL.md) | AppLlama 使用流程 |
| [skills/logo-design](skills/logo-design/SKILL.md) | Logo 设计流程与参考库 |
| skills/aso-* 等 40 个目录 | ASO：关键词、元数据、截图、投放、留存等 |

上游：

- https://github.com/CreditTone/android-reverse-engineering-skill
- https://github.com/ceorkm/mobile-app-ui-design
- https://github.com/appeeky/aso-skills
- https://github.com/Appllama/appllama-skills
- https://github.com/kaankiziltug/logo-design-skill

各技能目录内保留了上游 `LICENSE`。`logo-design` 的商标说明见 `TRADEMARKS.md`。

## 新增 Skill

```bash
mkdir -p skills/<skill-name>
# 编写 skills/<skill-name>/SKILL.md
# 细节多时再拆 reference-*.md，并在 SKILL.md 里链接过去
git add skills/<skill-name>
git commit -m "docs: add <skill-name> skill"
git push
```
