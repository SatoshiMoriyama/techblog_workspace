企画分析が完了しました。レポートをまとめます。

---

## 企画分析レポート

### 1. 企画内容の確認

| 項目 | 内容 | 状態 |
|------|------|------|
| テーマ | Amazon Aurora PostgreSQL Serverlessの「数秒でデータベース作成」新機能を試す | 明確 |
| 投稿先 | Qiita（URLは単独行で貼る形式） | 指定済み |
| ターゲット読者 | 普段AWSでAuroraを使っているユーザー | 明確 |
| 記事の構成 | 6セクション構成（見出し案あり） | 明確 |
| 参考URL | AWS公式ブログ、公式ドキュメント、過去記事 | 3件あり |
| 優先度 | 高: 構成1〜4、中: 構成5〜6 | 指定済み |

→ 企画として必要な情報はすべて揃っています。ユーザーへの追加確認は不要です。

### 2. 技術調査の結果

参考URLおよびWeb検索から収集した技術情報のまとめです。

#### Express Configuration（新機能）の概要

- 2026年3月に発表された新機能
- 2クリック・数秒でAurora PostgreSQL Serverless v2データベースを作成できる
- VPCなしで作成される（従来のAuroraとの大きな違い）
- 新しい「Internet Access Gateway」を通じて、世界中どこからでもPostgreSQLワイヤプロトコルで接続可能
- IAM認証がデフォルトで有効（パスワードレス認証）
- ACU（Aurora Capacity Units）の秒単位従量課金
- AWS Free Tier対応
- 対応リージョン: AWSの商用リージョンすべて（中国、GovCloud、UAE、バーレーンを除く）

#### 制約事項（記事の構成4で使用）

記事に記載すべき制約事項が多数あります:

- Aurora PostgreSQLのみ対応（MySQLは非対応）
- カスタムKMSキー使用不可（AWS/RDSサービスキーのみ）
- VPC関連付け不可
- Internet Access Gatewayを無効化不可
- IAM認証のみ（他の認証方式は不可）
- エンジンバージョンの選択不可（アップグレードのみ可）
- IPv4のみ対応（IPv6非対応）
- 非対応機能: Aurora Limitless Database、Aurora Global Database、RDS Proxy、Aurora Zero-ETL Integration、RDS Query Editor、Blue/Green Deployments、Database Activity Streams、Zero Downtime Patching、Babelfish

#### IAM認証トークン（構成6の過去記事との接点）

- Express Configurationでは IAM認証がデフォルト有効
- 15分有効なエフェメラルトークンをパスワードとして使用
- `rds-db:connect` 権限が必要
- 過去記事（Aurora DSQLのSQLAlchemy接続）でも同じ15分トークンの仕組みを使っている → 共通点として紹介可能

#### DSQLとの比較ポイント（構成5で使用）

- DSQLもAuroraもどちらもサーバーレス・秒単位課金
- Express ConfigurationによりAurora PostgreSQLも「数秒で起動」が可能に
- DSQLはマルチリージョン対応が強み、Express ConfigはVPC不要で手軽さが強み
- IAM認証トークンの仕組みが共通
- 指示書のメモ:「これがあるならもうDSQLを無理に使わなくても…って感じは少しする」

### 3. 既存記事の文体確認

過去記事（Aurora DSQLでSQLAlchemyを使ったコネクションプーリング）から確認した文体特徴:

- カジュアルで親しみやすい口語調（「簡単にできたので、短い記事です」）
- 理論より実装例を優先する構成
- 主観的な評価も素直に書く（「とっても良いサーバレスのサービスなのでは」）
- GitHubリンクの埋め込みあり
- Knowledgeの文体ルールと一致

### 4. 執筆方針

#### 記事タイトル案

「Amazon Aurora PostgreSQL Serverlessの新機能で数秒でデータベースを作成してみた」

#### 見出し構成（テンプレートに沿って）

```
## はじめに
- 背景: Express Configurationの発表（2026年3月）
- 動機: 数秒でDB作成できるとのことなので試してみた

### この記事で学べること
- Express Configurationとは何か
- 実際のDB作成手順
- Internet Access Gatewayを通じた接続方法
- 制約事項
- DSQLとの使い分けの所感

### 前提知識・条件
- AWSアカウント
- AWS CLIまたはマネジメントコンソール
- バージョン情報テーブル

## Express Configurationとは？
- 新機能の概要説明
- VPC不要、IAM認証デフォルト、Internet Access Gateway
- 従来のAurora作成との違い

## やってみた
### Step 1: データベースを作成する
- マネジメントコンソールでの手順（2クリック）
- <!-- TODO: screenshot - DB作成画面 -->
- 数秒でAvailableになることの確認

### Step 2: データベースに接続する
- IAM認証トークンの取得
- psqlまたはCloudShellでの接続
- <!-- TODO: screenshot - 接続成功画面 -->

### 制約事項
- 主な制約をテーブル形式で整理
- 非対応機能の一覧

## DSQLとの比較についての所感
- 「これがあるならDSQLを無理に使わなくても…」という視点
- ただし断定は避け、ユースケースの違いを示す
- ガイドライン通り一方的な結論は出さない

## 過去記事の紹介
- IAM認証トークン接続が共通であること
- 過去記事リンク（Qiita埋め込み形式）

## まとめ
- 要点を箇条書き
- 感想・今後の展望
```

#### 文体の方針

- ですます調、語尾のバリエーション（〜です/〜ですね/〜してみました/〜みたいです）
- 「では、早速試してみます！」のような読者を誘う語り口
- 感嘆符は適度に
- 同じ語尾を3回以上連続させない
- リンクはQiita形式（URL単独行）

#### スクリーンショットマーカーの挿入箇所

- DB作成画面（Express Configuration選択画面）
- DB作成完了画面（Available状態）
- 接続成功画面（psqlまたはCloudShell）
- 制約事項が確認できる設定画面（必要に応じて）

#### 参考リンク（記事中に貼るもの）

- AWS公式ブログ: https://aws.amazon.com/jp/blogs/aws/announcing-amazon-aurora-postgresql-serverless-database-creation-in-seconds/
- 公式ドキュメント: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_GettingStartedAurora.AuroraPostgreSQL.ExpressConfig.html
- 過去記事: https://qiita.com/s_moriyama/items/35600a26f0c83f30a4ee

#### 記事に含めないこと（指示書より）

- SQLModel / SQLAlchemyベースのサンプルコード組み込みの話

### 5. 確認事項

ユーザーへの確認事項はありません。企画に必要な情報はすべて揃っています。