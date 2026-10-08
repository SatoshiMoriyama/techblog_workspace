# yomiyasu（推敲スキル参照）

AI が生成した日本語の不自然な比喩、曖昧な主述、偏った構文を、意味を保ったまま読みやすく整えるための推敲スキル。本文を実際に書き直す推敲ステップ（polish）で使う。

スキル本体はローカルに配置済み。コピーは持たず、作業のたびに下記の実ファイルを読んで最新の指針に従う。更新は `npx skills update yomiyasu` でローカルが新しくなり、次の実行から反映される。

## 作業前に必ず読むファイル（絶対パス）

推敲を始める前に、次を read tool で読み込み、その指針に従うこと。GitHub など外部へは取りに行かない。

- `/Users/mori/.kiro/skills/yomiyasu/SKILL.md` — 推敲の全原則と実行手順（必読）
- `/Users/mori/.kiro/skills/yomiyasu/references/domains/tech.md` — 技術記事向けドメイン仕様（このブログは tech ドメイン）
- `/Users/mori/.kiro/skills/yomiyasu/references/slop-catalog.md` — 不自然な語彙・構文と言い換え候補のカタログ

必要に応じて以下も参照する。

- `/Users/mori/.kiro/skills/yomiyasu/references/gemini-syntax.md`
- `/Users/mori/.kiro/skills/yomiyasu/scripts/yomiyasu_lint.py` — 静的検査（任意）
- `/Users/mori/.kiro/skills/yomiyasu/scripts/yomiyasu_diff.py` — 推敲前後の差分点検（任意）

## このワークフローでの使い方

- 立場は「説明」（技術調査の報告・体験）。ドメインは tech。
- 対象ファイルは `blog_content/blog.md`。本文を直接書き換える。
- SKILL.md の最優先ルール（意味の保持・情報の不増補）を守る。主張・比重・言い切りの強さ・文の働きを変えない。原文にない事実・担当者・数値・条件を足さない。
- SKILL.md 末尾の「出力フォーマット（変えたところ／書き手に確かめたい点）」は対話リライト用。このステップでは本文を直接編集するので、その対話フォーマットは本文に混入させない。変更の要約はステップのレポートに書く。
- このブログ特有の文体ルールは writing-style・blog-guidelines の facet が優先。yomiyasu の一般原則とこのブログの文体が食い違う場合は、ブログの文体ルールを優先する（口語の語尾「〜ですね」「〜みたいです」や、トーンを担う見出しは散らす目的で変えない）。
