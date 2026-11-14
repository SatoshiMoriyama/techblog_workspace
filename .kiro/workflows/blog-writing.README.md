# blog-writing レシピ（takt からの移植）

> このファイルを変更する前に `.kiro/workflows/blog-writing.decisions.md` を読むこと。記録された決定に反する変更（ルールの削除・元の形への巻き戻し）をしない。

`.takt/workflows/blog-writing.yaml` を Kiro workflows のレシピ（カスタムエージェント + ワークフロー JSON）に移植したもの。既存の takt 定義は残したまま、新規に以下を追加した。

- `.kiro/agents/`: カスタムエージェント5体（blog-planner / blog-writer / tech-reviewer / blog-editor / blog-polisher）
- `.kiro/workflows/blog-writing.workflow.json`: ワークフロー本体

## 実行

Kiro の `run_workflow` にこのレシピを読み込ませる。`inputs` に `task`（企画）と任意で `workdir`（対象リポジトリの絶対パス）を渡す。`task` には企画のテーマ・構成・ターゲット読者・参考資料・投稿先プラットフォームを書く。入力資料が `blog_content/memo.md` などにある場合はそのパスも渡す。

## ステップフロー

```text
setup（実行ディレクトリ作成）
  → plan（企画確認・方針策定）
  → write（執筆、blog_content/blog.md に出力）
  → lint（markdownlint + textlint）
  → review-loop（repeat, maxIterations=3, onMaxIterations=pause）:
       reviewers（3並列: tech-review / writing-review / ai-review）
         → aggregate（3判定を集約して review.json に verdict を書く）
         → fix（指摘修正）
         → polish（yomiyasu 推敲）
         → lint-fix（markdownlint + textlint 再実行）
     stopCondition: review.json の loopAction が "exit" になったらループ終了
```

- `setup` は実行ごとに `<base>/.agents/blog-writing/<timestamp>/` を作る。レビュー成果物（各レビュー .md、`review.json`、`decisions.json`）をここに置く。
- repeat の `stopCondition.fileCheck` は `review.json` の `loopAction == "exit"` を判定する。各周の末尾（lint-fix）まで回った後に再評価され、未達なら reviewers から次周へ。
- `loopAction` は aggregate が書く。verdict が `APPROVED` なら `exit`、`CHANGES_REQUESTED` なら `continue`。ユーザーが「ループを終了する」と判断した場合は verdict を `CHANGES_REQUESTED` のまま残し、`loopAction` だけ `exit` にする。fix / polish / lint-fix は `loopAction == "exit"` なら何もしない。
  - 背景: `update_workflow` の `update_status`（nodeId=review-loop）は maxIterations で止まったループにしか効かず、途中の周でループだけを抜けられなかった。aggregate を完了扱いにすると後続の fix から次周に進んでしまう。

### 既決事項の引き継ぎ（decisions.json）

- aggregate は、ユーザーの判断（対応 accepted / 却下 rejected / 見送り deferred）を `decisions.json` に追記する。`review.json` は毎周上書きされるが、`decisions.json` は実行中ずっと残る。
- 3レビュアーはレビュー前に `decisions.json` を読み、rejected / deferred の論点を再指摘しない（判定・スコアの根拠にもしない）。除外した指摘はレビューファイル末尾に列挙する。他レビュアーの結果ではないので ANTI-BIAS の対象外。
- aggregate も指摘を `decisions.json` と照合し、既決の論点は `status: rejected` で残す。未達レビューがあっても、open の blocking 指摘が残っていなければ `APPROVED` にする。
  - 背景: 初回実走で、却下・見送りにした指摘（イベントの時間、感想の薄さ等）が次周のレビュアーにそのまま再掲され、ループが空転した。
- 収束しない場合は `onMaxIterations: pause` で 3 周上限で停止し、オーケストレーター（親セッション）に委ねる。これは本リポジトリの workflow-review steering（実装ループの maxIterations=3 上限、収束しなければ pause）に合わせた。takt 側は通算4周が上限だが、Kiro 側では 3 に引き下げている。

### ループ構造の既知の挙動（初回実走で確認すること）

- `stopCondition` は**各周の末尾（lint-fix の後）で評価される**。そのため初回レビューで `verdict == "APPROVED"` になっても、同じ周の `fix → polish → lint-fix` は一度起動する。これらのステップには prompt で「loopAction が exit なら何もせず報告だけする」no-op 指示を入れて無害化している。no-op が実際に効くかは未確認（初回実走では APPROVED にもループ終了にも到達していない）。記事を壊す経路ではないが、無駄な起動が気になる場合は repeat の判定位置を見直す（現状は Kiro の repeat が末尾で stopCondition を評価する仕様に合わせた設計）。初回実走で no-op 指示が効くことを確認する。
- 3 周とも `CHANGES_REQUESTED` のまま上限に達した場合、**最後の `fix → polish → lint-fix` の結果は再レビューされないまま pause する**（次周の reviewers に入る前に maxIterations で止まるため）。pause 後にオーケストレーター／ユーザーが最終成果物を直接確認するか、`extend_repeat` で追加周を与えて再レビューさせること。
- エージェント JSON の `tools` は実行環境のツール名と一致させる必要がある（不一致の名前はエラーにならず黙って無視される）。初回実走で `fs_read` / `grep` / `glob` / `web_search` が解決されず、planner がローカルファイルを読めなかったため、`read_file` / `grep_search` / `file_search` / `remote_web_search` に置換した。成果物ファイルを書くステップ（plan / 各レビュー / aggregate）のエージェントには `fs_write` を、記事を編集する writer / polisher には `str_replace` を追加した。`report` は対応する実名を確認できておらず、未解決のまま残している。

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
3. repeat の `stopCondition` が `review.json` の `loopAction == "exit"` を判定してループ終了を決める（APPROVED、またはユーザーによるループ終了）。
4. `CHANGES_REQUESTED` のときは aggregate が `send_message`（severity=warning）で指摘の要点を報告し、ユーザー／オーケストレーターの判断を仰ぐ。

`writing-review` は `docs/blog-evaluation.md` の7観点採点（合否対象6観点が全て4.0以上で合格、人間らしさは参考）を踏襲する。

### takt 固有の挙動で保持したもの

- `write`: 出力先は `blog_content/blog.md`。入力資料の画像内容を読み取って反映。画像箇所に `<!-- TODO: screenshot - 説明 -->` マーカーを挿入。リンク埋め込み形式を投稿先（Qiita=URL単独行 / はてなブログ=`[URL:embed:cite]`）で切り替え。
- `plan`: 投稿先プラットフォーム未指定ならユーザーに確認する（`send_message` severity=warning で pause）。
- `lint` / `lint-fix`: markdownlint と textlint を実行しエラー0まで修正。`.markdownlint.json` と `.textlintrc.json` に従う（`package.json` の `lint` スクリプトと同じ組み合わせ。初版は markdownlint のみで、textlint のエラーが残ったまま完了したため追加）。takt の yaml は `npx markdownlint-cli` だったが、このプロジェクトの実際の依存は `markdownlint-cli2`（`package.json` の `lint` スクリプト）なので、コマンドを `markdownlint-cli2` に合わせた。

## 検証

- 5つのエージェント JSON とワークフロー JSON が JSON として valid であることを確認。
- ワークフロー JSON を Kiro のワークフロー zod スキーマ（`kiro.kiro-agent` の bundle から再構成）で検証し、適合を確認（node types の discriminated union、repeat の maxIterations/stopCondition/onMaxIterations、parallel の joinPolicy、step の agent/prompt/modelId/effortLevel、fileCheck の許可キー path/jsonPath/value）。
- 5つのエージェント JSON を Kiro のエージェント zod スキーマ（同 bundle、file-based agent variant）で検証し、適合を確認。
