# Meet 金牛: the X article (owner, 2026-11-04)

Cover: `brand/jinniu/social/x-article-cover-2500x1000.png` (5:2, as X recommends). Every figure below is the live configuration: the PlatformConfig's split (docs/VERIFIED.md item 33), `MIN_HOLDER_USD=10`, `DELIVERY_FEE_USD=0.02`, `AUTO_PUSH_MIN_USD=1`, `LATE_AFTER_SEC=900`, graduation at 85 SOL (`LAUNCHLAB_DEFAULT_CURVE`), no launch fee and a create cost of about 0.009 SOL (the create page on jinniu.fun, 2026-11-04). Publish it once launches are open and payouts are live (`go-live.sh launches open`, `payouts live`), so "every hour" is true the day it's read.

---

## English

**Title:** Meet 金牛: memecoins that pay real stock dividends

Most memecoins give holders one thing: a chart. 金牛 (jīnniú, "golden bull") gives them a second one: a dividend, paid in real tokenized stocks, every hour.

土狗也分红，分的是美股. Even a memecoin pays dividends, and they're paid in US stocks.

### How it works

1. **Launch a coin and pick a stock.** A name, a ticker, a picture, and the stock your holders will earn: NVDAx, SPYx, TSLAx, AAPLx and more. The stock is locked once the coin is live.
2. **Every trade buys it.** 0.50% of every trade on the bonding curve goes to that coin's holders. At the top of each hour, it buys the coin's stock.
3. **Holders get paid every hour.** The stock goes straight to every holder's wallet, in proportion to what they hold.

### Where the 1.25% goes

Every trade on the curve pays 1.25%, split in the open:

- 0.50% to holders, paid in the coin's stock
- 0.35% to 金牛
- 0.15% to the creator
- 0.25% to Raydium, which runs the curve

At 85 SOL a coin graduates to a Raydium pool, and the pool's fees apply from then on.

### How payouts are calculated

- Balances are snapshotted twice an hour: once at a secret random minute, once at the round. You're paid on the smaller of the two, so buying right before the round and selling right after earns nothing.
- Hold $10 or more of the coin to qualify. The curve, the pool and 金牛's own wallets are left out.
- A $0.02 delivery fee comes out of each payout, and a wallet's first payout also covers its new token account. Amounts too small to send wait for the next hour.
- Every round gets a public receipt on jinniu.fun/payouts, with a link to its transaction. A round more than 15 minutes late is flagged.

### A fair launch

- Every coin launches in a private bundle, so nobody sees it before it's live: no sniper in block 0.
- The creator's dev buy, if there is one, rides in the create itself and is shown on the coin's page for everyone.
- When a coin graduates, its pool's liquidity is locked for good with Raydium Burn & Earn. It keeps earning fees, and nobody can pull it, 金牛 included.

### For creators

- No launch fee right now. You only pay the cost of creating the coin on chain, about 0.009 SOL.
- You earn 0.15% of every trade on your coin and claim it from your coin's page.

### Good to know

Tokenized stocks are issued by third parties and aren't available everywhere; 金牛 isn't available in the US. Memecoins are risky, and nothing here is financial advice.

**Launch your coin at jinniu.fun · Follow @jinniupad**

---

## 中文

**标题：** 认识金牛：会分红的土狗，分的是美股

大多数土狗只给持有人一样东西：K 线。金牛再多给一样：分红，用真实的股票代币发放，每小时一次。

土狗也分红，分的是美股。

### 怎么玩

1. **发币，选一只股票。** 名称、代币符号、图片，再选好持有人将获得的股票：NVDAx、SPYx、TSLAx、AAPLx 等。代币上线后，分红股票就锁定了。
2. **每笔交易都在买入它。** 内盘上每笔交易的 0.50% 归这个代币的持有人，每小时整点用来买入这只股票。
3. **每小时发给持有人。** 股票直接发到每个持有人的钱包，按持仓比例分配。

### 1.25% 去哪了

内盘上每笔交易收 1.25%，分成公开透明：

- 0.50% 给持有人，以该代币的股票发放
- 0.35% 给金牛
- 0.15% 给创建者
- 0.25% 给 Raydium（内盘由它运行）

募集到 85 SOL 后，代币毕业进入 Raydium 池子，之后按池子的费率。

### 分红怎么算

- 每小时拍两次持仓快照：一次在随机的秘密时间，一次在整点。按两次中较少的那个余额分红，所以整点前买入、整点后卖出分不到。
- 持有 $10 以上才能分红。内盘、池子和金牛自己的钱包不参与。
- 每次发放扣除 $0.02 手续费，钱包第一次收到时还要支付新建代币账户的费用。金额太小的会累积到下一小时再发。
- 每一轮在 jinniu.fun/payouts 都有公开收据，附链上交易链接。晚了超过 15 分钟的一轮会被标记。

### 公平发币

- 每个代币都用私有捆绑交易发出，上链前没人看得到：0 号区块无狙击。
- 创建者的开发者首买（如果有）包含在创建交易里，代币页面会向所有人公开。
- 代币毕业后，池子的流动性用 Raydium Burn & Earn 永久锁定。它继续赚手续费，谁都拿不走，金牛也不行。

### 给创建者

- 目前没有发币费，只需支付链上创建代币的费用，约 0.009 SOL。
- 你的代币每笔交易你都能拿到 0.15%，在代币页面领取。

### 须知

股票代币由第三方发行，并非所有地区都能使用；金牛不对美国开放。土狗风险很高，本文不构成投资建议。

**在 jinniu.fun 发币 · 关注 @jinniupad**
