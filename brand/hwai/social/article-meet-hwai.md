# X article: Meet hwai

Header image: `article-meet-hwai-3000x1200.png` (5:2, as X recommends). Renderer: `brand/hwai/src/article.cjs`.
Every number matches hwai's How it works page and the server's settings (go-live.sh: $10 floor, $0.02 per
send). "No launch fee" holds while LAUNCH_FEE_LAMPORTS is unset: change that line if the owner sets a fee.
Account: @HwaiPad.

---

**Title:** Meet hwai: memecoins that pay you real stock dividends

hwai is a memecoin launchpad on Solana with one difference: every coin pays its holders a dividend in a tokenized stock, every hour. Hold a coin that pays in NVDAx, and NVDAx lands in your wallet.

> 土狗也分红，分的是美股。

## The idea

Memecoins are fun to trade, but holding one pays you nothing. On hwai, every trade funds a dividend in real stock tokens for the people who hold the coin.

## 1. Launch a coin

Pick a name, a ticker, a picture, and the stock your holders will earn: NVDAx, SPYx, TSLAx, AAPLx, QQQx, GOOGLx and more. The stock is locked once the coin is live.

There's no launch fee. Your wallet signs the create and pays only the network cost of creating the coin, so on chain the coin is yours.

## 2. Every trade pays 1.25%

Every buy and sell on the bonding curve pays 1.25%, taken on chain by Raydium LaunchLab:

- **0.50%** to the coin's holders, as their dividend
- **0.15%** to the coin's creator
- **0.35%** to hwai
- **0.25%** to Raydium, which runs the curve

## 3. Paid every hour

At the top of every hour, the holders' share buys the coin's stock token and sends it to every wallet holding at least **$10** of the coin, in proportion to what it holds. Every round is a public receipt on hwai.ai.

## 4. Graduation at 85 SOL

When buyers have put 85 SOL into the curve, the coin graduates to a Raydium pool. Its liquidity is locked forever with Raydium Burn & Earn: nobody can pull it, hwai included. After graduation a trade pays 0.30%, and the dividends keep coming every hour.

## Fair from the first block

- **No snipers.** Every coin is created in a private Jito bundle. Its address isn't public before it lands, so nobody buys in block 0.
- **Dev buys shown.** A creator's first buy sits inside the create itself, and every coin page shows it.
- **Locked liquidity.** At graduation the pool is locked for good.
- **On chain.** Fees, payouts and receipts can all be checked.

## Good to know

- Tokenized stocks are issued by third parties such as xStocks. They track a share's price, carry no voting rights, and aren't available in some countries, including the United States.
- Holders pay their own delivery: each send keeps a $0.02 fee from the dividend, and a wallet's first send of a stock also covers the rent of its new token account (about 0.002 SOL), which comes back if the account is closed.
- Most new coins never graduate, and payouts depend entirely on trading volume. Nothing here is financial advice.

## Official links

The only official places are **hwai.ai** and **@HwaiPad**. A contract address posted anywhere else is fake.

土狗也分红，分的是美股。🐂

---

# 中文版

**标题：** 认识 hwai：土狗也分红，分的是美股

hwai 是 Solana 上的发币平台，只有一点不同：每个代币每小时都用股票代币给持有人分红。持有分红 NVDAx 的代币，NVDAx 就会发到你的钱包。

## 想法

土狗好玩，但拿着不赚分红。在 hwai，每一笔交易都在为持有人买入真实的股票代币。

## 1. 发币

填上名称、代币符号、图片，再选好持有人将获得的股票：NVDAx、SPYx、TSLAx、AAPLx、QQQx、GOOGLx 等。代币上线后，分红资产就锁定了。

不收发币费。由你的钱包签名创建，只付创建代币的网络费用，所以在链上这个代币属于你。

## 2. 每笔交易 1.25%

内盘上的每笔买入和卖出都付 1.25%，由 Raydium LaunchLab 在链上收取：

- **0.50%** 给持有人，作为分红
- **0.15%** 给创建者
- **0.35%** 给 hwai
- **0.25%** 给 Raydium

## 3. 每小时分红

每个整点，持有人的部分会买入代币对应的股票代币，按持仓比例发给持有 **$10** 以上的钱包。每一轮都是 hwai.ai 上的公开收据。

## 4. 满 85 SOL 毕业

内盘满 85 SOL 后，代币毕业进入 Raydium 池子，流动性通过 Raydium Burn & Earn 永久锁定，谁都取不出来，包括 hwai。毕业后每笔交易付 0.30%，分红照常每小时发放。

## 从第一个区块就公平

- **无狙击。** 每个代币都用 Jito 私有捆绑创建，上链前没人知道合约地址，0 号区块没人能买。
- **首买公开。** 创建者的首买包含在创建交易里，每个代币页面都会显示。
- **流动性锁定。** 毕业后池子永久锁定。
- **链上可查。** 手续费、分红和收据都能核对。

## 须知

- 股票代币由 xStocks 等第三方发行，跟踪股价，没有投票权，部分国家和地区（包括美国）无法使用。
- 分红的发送费用由持有人承担：每次发送从分红中扣除 $0.02；钱包第一次收到某个股票时，还要支付新建代币账户的租金（约 0.002 SOL），关闭账户后可以拿回。
- 大部分新币不会毕业，分红完全取决于交易量。本文不构成投资建议。

## 官方渠道

官方渠道只有 **hwai.ai** 和 **@HwaiPad**。其他地方发布的合约地址都是假的。
