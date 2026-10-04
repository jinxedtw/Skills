---
name: reply-user-review
description: >-
  Draft a Google Play / app-store reply to a user review in the same language as
  the original review (max 350 characters) and supply a Simplified Chinese
  translation (中文对照). Requires the original review text; reply tone/guidance is
  optional. Use when the user says 帮我回复评价, 帮我回复, 回复用户的评价, 回复评价,
  用户评价, reply to review, or /reply-user-review.
---

# 回复用户评价

回复用户的评价，
需要用户的原评价
1.回复时提供对应语言的评价，不能超过350个字，以及中文对照

## 缺原文先问

没有用户的原评价时，先向用户要原文（可附商店语言/星级），不要先写回复。

## 回复倾向（非必要）

执行时同时询问：需要回复的倾向或者引导是什么（例如：告诉用户可以同时设置全局默认设置和单个任务的设置，并且询问具体问题是什么）。

- 本条消息里已经给出倾向/引导 → 直接按该引导写，不必再问。
- 尚未给出 → 可以问一句；用户不给也继续写，不要卡住。

## 执行

- 「对应语言」= 原评价所用语言（含口语/缩写也用该语言回复）。
- 「不能超过350个字」按商店回复上限执行：目标语言正文 **不超过 350 个字符**（含空格与换行）。写完后自行计数；超限必须删减后再给出。
- 先给出可直接粘贴的商店回复，再给出中文对照。不要把中文对照算进 350 限制。
- 语气礼貌、简短；不承诺未实现功能；不清楚的点用提问收口，方便用户继续说明。
