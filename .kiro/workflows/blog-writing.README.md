# blog-writing レシピ（takt からの移植）

`.takt/workflows/blog-writing.yaml` を Kiro workflows のレシピ（カスタムエージェント + ワークフロー JSON）に移植したもの。既存の takt 定義は残したまま、新規に以下を追加した。

- `.kiro/agents/`: カスタムエージェント5体（blog-planner / blog-writer / tech-reviewer / blog-editor / blog-polisher）
- `.kiro/workflows/blog-writing.workflow.json`: ワークフロー本体

## 実行

Kiro の `run_workflow` にこのレシピを読み込ませる。`inputs` に `task`（企画）と任意で `workdir`（対象リポジトリの絶対パス）を渡す。`task` には企画のテーマ・構成・ターゲット読者・参考資料・投稿先プラットフォームを書く。入力資料が `blog_content/memo.md` などにある場合はそのパスも渡す。

## ステップフロー

```
setup（実行ディレクトリ作成）
  → plan（企画確認・方針策定）
  → write（執筆、blog_content/blog.md に出力）
  → lint（markdownlint）
  → review-loop（repeat, maxIterations=3, onMaxIterations=pause）:
       reviewers（3並列: tech-review / writing-review / ai-review）
         → aggregate（3判定を集約して review.json に verdict を書く）
         → fix（指摘修正）
         → polish（yomiyasu 推敲）
         → lint-fix（markdownlint 再実行）
     stopCondition: review.json の verdict が "APPROVED" になったらループ終了
```

- `setup` は実行ごとに `<base>/.agents/blog-writing/<timestamp>/` を作る。レビュー成果物（各レビュー .md と `review.json`）をここに置く。ループの `stopCondition` は `{{setup.output}}/review.json` の `verdict` を見る。
- repeat の `stopCondition.fileCheck` は `review.json` の `verdict == "APPROVED"` を判定する。各周の末尾（lint-fix）まで回った後に再評価され、未達なら reviewers から次周へ。
- 収束しない場合は `onMaxIterations: pause` で 3 周上限で停止し、オーケストレーター（親セッション）に委ねる。これは本リポジトリの workflow-review steering（実装ループの maxIterations=3 上限、収束しなければ pause）に合わせた。takt 側は通算4周が上限だが、Kiro 側では 3 に引き下げている。

## takt → Kiro の対応関係

### ペルソナ → カスタムエージェント

| takt persona | Kiro agent | knowledge（resources で添付） | 担当ステップ |
| --- | --- | --- | --- |
| blog-planner | `blog-planner` | writing-style, blog-guidelines | plan |
| blog-writer | `blog-writer` | writing-style, blog-guidelines | write, lint, fix, lint-fix |
| tech-reviewer | `tech-reviewer` | blog-guidelines | tech-review |
| blog-editor | `blog-editor` | writing-style, blog-guidelines, anti-ai-smell, docs/blog-evaluation.md | writing-review, ai-review, aggregate |
| blog-polisher | `blog-polisher` | yomiyasu, writing-style, blog-guidelines | polish |

- takt は knowledge をステップ単位で割り当てるが、Kiro のエージェントは `resources`（`file://` の glob/パス）でコンテキストに添付する。blog-editor は writing-review（writing-style + blog-guidelines + blog-evaluation）と ai-review（anti-ai-smell）の両方を担うため、両方の knowledge を添付し、どちらの観点でレビューするかは各ステップの prompt で切り替える。
- persona 本文は takt の `.takt/facets/personas/*.md` の内容を各エージェントの `prompt` に移植した。
- yomiyasu はスキル本体（`.takt/skills/yomiyasu/`）を polish 実行時に read で読み込む。エージェントの prompt とステップ prompt の両方に「作業前に SKILL.md と references を読む」と明記した。

### モデル割当（runtime.yaml → workflow の step 単位 modelId）

takt の profile→model と、step→profile の割当を、実行環境で選択可能な正式モデルIDに解決した。

| takt profile | takt の model 値 | 設計意図 | 解決した Kiro modelId |
| --- | --- | --- | --- |
| opus | claude-opus-5.5 | 最上位 Claude | `claude-opus-5.5`（完全一致） |
| sonnet | claude-sonnet-5 | 中量級 Claude | `claude-sonnet-5.5`（代替。下記参照） |
| terra | gpt-5.6-terra | GPT（客観検出用） | `gpt-5.6-terra`（完全一致） |
| luna | gpt-5.6-luna | 軽量 GPT | `gpt-5.6-luna`（完全一致） |

| step | takt profile | Kiro step の modelId | effortLevel |
| --- | --- | --- | --- |
| setup | （takt になし） | gpt-5.6-luna | low |
| plan | opus | claude-opus-5.5 | high |
| write | opus | claude-opus-5.5 | high |
| lint | luna | gpt-5.6-luna | low |
| tech-review | terra | gpt-5.6-terra | high |
| writing-review | sonnet | claude-sonnet-5.5 | medium |
| ai-review | terra | gpt-5.6-terra | high |
| aggregate | （集約。sonnet 系） | claude-sonnet-5.5 | medium |
| fix | sonnet | claude-sonnet-5.5 | medium |
| polish | sonnet | claude-sonnet-5.5 | medium |
| lint-fix | luna | gpt-5.6-luna | low |

#### モデルID解決・代替の記録

- `claude-opus-5.5` / `gpt-5.6-terra` / `gpt-5.6-luna` は実行環境の選択可能モデル一覧に存在し、takt の値と完全一致で解決した。
- `claude-sonnet-5`（takt の sonnet profile）は実行環境の一覧に無かったため、生きている中量級 Claude の `claude-sonnet-5.5` に代替した。中量級 Claude という設計意図は保たれる。
- `setup` と `aggregate` は takt の元ワークフローには無い補助ステップ。`setup` は実行ディレクトリ作成のみなので軽量な `gpt-5.6-luna`、`aggregate` は3レビューの集約判定なので中量級の `claude-sonnet-5.5` を割り当てた。
- クロスモデルの設計意図を保持: 記事の執筆（plan / write）は Claude（opus）、AI臭さ検出（ai-review）は別モデルの GPT（terra）が客観的に行う。tech-review も GPT（terra）。writing-review / fix / polish は中量級 Claude。

### レビュー判定の集約（takt の rules → Kiro の parallel + aggregate + stopCondition）

takt は reviewers ステップの `rules` で `all("approved","すべて問題なし","AI臭さなし")` なら COMPLETE、`any(...)` なら fix と分岐していた。Kiro 側では:

1. `reviewers`（parallel, joinPolicy=all）で3レビューを並列実行し、それぞれが判定を自分のファイルに書く（`tech-review.md` / `writing-review.md` / `ai-review.md`）。各レビュアーは他レビュアーのファイルを読まない（ANTI-BIAS）。
2. `aggregate` ステップが3ファイルを読み、集約ルール（tech=approved かつ writing=すべて問題なし かつ ai=AI臭さなし のとき `APPROVED`、いずれか未達なら `CHANGES_REQUESTED`）を適用して `review.json` に `verdict` を書く。
3. repeat の `stopCondition` が `review.json` の `verdict == "APPROVED"` を判定してループ終了を決める。
4. `CHANGES_REQUESTED` のときは aggregate が `send_message`（severity=warning）で指摘の要点を報告し、ユーザー／オーケストレーターの判断を仰ぐ。

`writing-review` は `docs/blog-evaluation.md` の7観点採点（合否対象6観点が全て4.0以上で合格、人間らしさは参考）を踏襲する。

### takt 固有の挙動で保持したもの

- `write`: 出力先は `blog_content/blog.md`。入力資料の画像内容を読み取って反映。画像箇所に `<!-- TODO: screenshot - 説明 -->` マーカーを挿入。リンク埋め込み形式を投稿先（Qiita=URL単独行 / はてなブログ=`[URL:embed:cite]`）で切り替え。
- `plan`: 投稿先プラットフォーム未指定ならユーザーに確認する（`send_message` severity=warning で pause）。
- `lint` / `lint-fix`: markdownlint を実行しエラー0まで修正。`.markdownlint.json` に従う。takt の yaml は `npx markdownlint-cli` だったが、このプロジェクトの実際の依存は `markdownlint-cli2`（`package.json` の `lint` スクリプト）なので、コマンドを `markdownlint-cli2` に合わせた。

## 検証

- 5つのエージェント JSON とワークフロー JSON が JSON として valid であることを確認。
- ワークフロー JSON を Kiro のワークフロー zod スキーマ（`kiro.kiro-agent` の bundle から再構成）で検証し、適合を確認（node types の discriminated union、repeat の maxIterations/stopCondition/onMaxIterations、parallel の joinPolicy、step の agent/prompt/modelId/effortLevel、fileCheck の許可キー path/jsonPath/value）。
- 5つのエージェント JSON を Kiro のエージェント zod スキーマ（同 bundle、file-based agent variant）で検証し、適合を確認。
