# タスク計画

## 元の要求

Amazon Aurora PostgreSQL Serverlessの「数秒でデータベース作成」新機能（Express Configuration）を実際に試してみるテックブログ記事の執筆。Qiitaに投稿予定。

## 分析結果

### 目的

2026年3月に発表されたAurora PostgreSQL ServerlessのExpress Configuration機能について、実際にDB作成・接続を試し、制約事項やDSQLとの比較所感を含めた実践記事を執筆する。

### 参照資料の調査結果

#### AWS公式ブログ（2026/3/25発表）
- Express Configurationにより2クリック・数秒でAurora PostgreSQL Serverless v2を作成可能
- VPCなしで作成され、新しいInternet Access Gatewayを通じてどこからでも接続可能
- IAM認証がデフォルト有効（パスワードレス）
- ACU秒単位従量課金、AWS Free Tier対応
- 対応リージョン: AWS商用リージョンすべて（中国、GovCloud、UAE、バーレーン除く）

#### AWS公式ドキュメント（Express Configuration手順）
- コンソール: 「Create with express configuration in seconds」→「Create」の2クリック
- CLI: `aws rds create-db-cluster --engine aurora-postgresql --with-express-configuration`
- 設定項目: DB Cluster Identifier・容量範囲は変更可、暗号化キー・認証方式・ポート・VPCは変更不可
- 接続方法: Code Snippets、CloudShell、Get Token Utilityの3種
- IAM認証トークン有効期限: 15分
- 制約事項が多数あり（後述）

#### 過去記事（Aurora DSQL + SQLAlchemy コネクションプーリング）
- DSQLでも15分IAM認証トークンを使用 → Express Configurationとの共通点
- `@event.listens_for`で新規接続時にトークン取得する実装
- 文体: カジュアルで親しみやすい口語調、実装重視、主観的評価も素直に記載

### スコープ

blog_content/blog.md に記事を執筆する。記事の構成は指示書の6セクションに従う。

- 高優先: 新機能紹介・DB作成・接続・制約事項（記事の本体）
- 中優先: DSQLとの比較所感、過去記事紹介

### 実装アプローチ

blog_content/blog.md のスケルトンを以下の見出し構成で肉付けする。

```
# Amazon Aurora PostgreSQL Serverlessの新機能で数秒でデータベースを作成してみた

## はじめに
背景: Express Configurationの発表（2026年3月25日）
動機: 数秒でDB作成できるとのことなので試してみた

### この記事で学べること
- Express Configurationとは何か
- 実際のDB作成手順（2クリック）
- Internet Access Gatewayを通じた接続方法
- 制約事項の整理
- DSQLとの使い分けの所感

### 前提知識・条件
- AWSアカウント（Free Tier対応）
- バージョン情報テーブル（Aurora PostgreSQL、Serverless v2）

## Express Configurationとは？
- 新機能の概要（2クリック・数秒でDB作成）
- VPC不要、Internet Access Gateway、IAM認証デフォルト有効
- 従来のAurora作成フローとの違いを簡潔に

## やってみた

### Step 1: データベースを作成する
- マネジメントコンソールでの手順
- <!-- TODO: screenshot - Express Configuration選択画面 -->
- <!-- TODO: screenshot - DB作成完了（Available状態）画面 -->
- 実際に数秒で作成できたことの報告

### Step 2: データベースに接続する
- IAM認証トークンの取得方法（15分有効）
- psqlまたはCloudShellでの接続手順
- <!-- TODO: screenshot - 接続成功画面 -->
- コードスニペット機能の紹介

### 制約事項
- テーブル形式で制約を整理
  - カスタムKMSキー不可、VPC不可、IAM認証のみ、IPv4のみ
  - 非対応機能一覧（Limitless、Global DB、RDS Proxy、Blue/Green等）

## DSQLとの比較についての所感
- 「これがあるならDSQLを無理に使わなくても…」という視点
- ただしDSQLにはマルチリージョン対応などの強みがある
- ユースケースの違いを示し、一方的な結論は避ける
- ガイドラインに従い断定的表現を使わない

## 過去記事の紹介
- IAM認証トークン接続が共通であること
- 過去記事リンク（Qiita URL単独行で埋め込み形式）

## まとめ
- 要点を箇条書き（Express Configurationの手軽さ、制約、使い分け）
- 感想・今後の展望
- 「誰かのお役に立てると幸いです〜。」的な締め
```

## 実装ガイドライン

- 文体: ですます調で統一。語尾のバリエーション（〜です/〜ですね/〜してみました/〜みたいです/〜かなと思いました）を使い分け、同じ語尾を3回以上連続させない
- リンク形式: Qiita向け。URL単独行で貼る（埋め込みカードになる）
- コードブロック: 言語指定必須（bash, console, json等）。前後に説明文を添える
- スクリーンショット: `<!-- TODO: screenshot - ○○ -->` マーカーを挿入（最低3〜4箇所）
- テーブル: 制約事項の整理、前提条件のバージョン情報に使用
- 参考リンク: 公式ブログ、公式ドキュメント、過去記事の3件を記事中に配置
- 記事の長さ: 2000〜5000文字程度（コードブロック除く）
- トーン: 読者と同じ目線で学んでいくスタンス。「では、早速試してみます！」のような語り口
- DSQLとの比較: 一方的な結論を出さない。「〜かなと感じています。」のような個人的見解の形で
- 含めないこと: SQLModel / SQLAlchemyベースのサンプルコード組み込みの話

## スコープ外

| 項目 | 除外理由 |
|------|---------|
| SQLModel / SQLAlchemyベースのサンプルコード | 指示書で明示的に除外指定 |
| CLIでのDB作成手順の詳細 | コンソール手順を主軸とし、CLIは補足程度に |
| 料金の詳細比較 | 企画の構成に含まれていない |

## 確認事項

なし。企画に必要な情報（テーマ、投稿先、ターゲット読者、構成、参考URL、優先度）はすべて揃っています。