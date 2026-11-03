import type { ReactNode } from "react";
import { BRAND, BRAND_LATIN } from "@/lib/brand";
import { defineMsgs } from "../lang";

/** Renders a link around its text; the component keeps the link's markup, the message its words. */
type LinkFn = (text: string) => ReactNode;

/** A coin's page (app/coin/[ticker], components/coin/CoinView): the prototype's `#coin` view. */
export const coinMsgs = defineMsgs(
  {
    sameTicker: (n: number) => `${n} coins use this ticker. Pick one, and check its address against the one the project posts.`,
    noCoin: (ticker: string, create: LinkFn) => (
      <>
        There&apos;s no coin called ${ticker} here yet. {create("Create it")}.
      </>
    ),
    coinFallback: "Coin",
    loading: "Loading the coin…",
    kpiMcap: "Market cap",
    kpiChange: "24h change",
    kpiVolume: "24h volume",
    kpiHolders: "Holders",
    kpiPaid: "Paid to holders",
    caCopied: "Contract address copied",
    createdBy: (creator: string, ago: string) => `Created by ${creator} · ${ago}`,
    copyCa: "Copy contract address",
    shareX: "Share on X",
    shareText: (ticker: string, asset: string, x: string) => `$${ticker} pays its holders in ${asset} every hour${x ? ` on @${x}` : ""} 🐂`,
    privateBundle: "Private bundle launch",
    devBoughtTitle: (share: string) => `The creator bought ${share} of the supply inside the create`,
    noDevBuyTitle: "The creator didn't buy any in the create",
    devBought: (share: string) => `Dev bought ${share}`,
    noDevBuy: "No dev buy",
    candleSize: "Candle size",
    chartOf: "Unit",
    price: "Price",
    marketCap: "Market cap",
    chartLabel: (unit: "price" | "mcap", ticker: string) => `${unit === "price" ? "Price" : "Market cap"} chart for $${ticker}`,
    ath: (usd: string) => `Market cap all-time high ${usd}`,
    hourlyPayout: "Hourly payout to holders",
    tabs: { trades: "Trades", holders: "Holders", payouts: "Payouts" },
    thWhen: "When",
    thSide: "Type",
    thWallet: "Wallet",
    thHolding: "Holding",
    thReceived: "Received",
    thRound: "Round",
    thPaid: "Paid",
    thValue: "Value",
    thWallets: "Wallets",
    thTx: "Tx",
    view: "View ↗",
    side: { buy: "Buy", sell: "Sell" },
    noTrades: "No trades yet. The first buyer gets the lowest price on the curve.",
    noHolders: "No holders yet.",
    /** A wallet the payouts leave out (the bonding curve, the pool…), named by why it's left out. */
    excluded: (name: string) => `${name} (not paid)`,
    excludedNames: { curve: "Raydium bonding curve vault", pool: "Raydium pool", launcher: "Launcher wallet", divvy: BRAND_LATIN, burn: "Burned" },
    na: "n/a",
    firstPayoutIn: (countdown: ReactNode) => <>The first payout is in {countdown}</>,
    firstPayoutNote: (minHolder: string, claim: boolean) =>
      `One round every hour, ${claim ? "credited" : "paid"} to every wallet holding ${minHolder} or more, by the size of its holding.`,
    nextPayout: "Next payout",
    lastRound: "Last round",
    lastRoundValue: (amount: string, asset: string, wallets: string) => `${amount} ${asset} · ${wallets} wallets`,
    noRoundYet: "None yet, the first round is coming up",
    paid24h: "Paid in 24h",
    payoutStatus: "Payout status",
    statusLate: "Late",
    statusCarried: "Carried to the next round",
    curveProgress: "Bonding curve",
    curveTitle: (target: string) => `Bonding curve, graduates at ${target}`,
    graduated: "Graduated",
    estimate: (amount: ReactNode) => <>Going by the last round, about {amount} an hour for you</>,
    estimateTag: "Estimate",
    estimateConnect: "Connect a wallet to see what you'd get, going by the last round.",
    cardNote: (minHolder: string, d: { claim: boolean; cardNoteVerb: string }) =>
      `Every wallet holding ${minHolder} or more at the hourly snapshot is ${d.cardNoteVerb}. Once the curve fills, the coin moves to a Raydium pool and payouts carry on.`,
    warn: "Different coins can use the same ticker and name. Before you buy, check the contract address against the one the project posts.",
  },
  {
    sameTicker: (n: number) => `有 ${n} 个代币使用这个代币符号。选一个，并把它的地址和项目方公布的地址核对一下。`,
    noCoin: (ticker: string, create: LinkFn) => (
      <>
        这里还没有叫 ${ticker} 的代币。{create("去创建一个")}。
      </>
    ),
    coinFallback: "代币",
    loading: "正在加载代币…",
    kpiMcap: "市值",
    kpiChange: "24 小时涨跌",
    kpiVolume: "24 小时交易额",
    kpiHolders: "持有人",
    kpiPaid: "累计分红",
    caCopied: "合约地址已复制",
    createdBy: (creator: string, ago: string) => `创建者 ${creator} · ${ago}`,
    copyCa: "复制合约地址",
    shareX: "分享到 X",
    shareText: (ticker: string, asset: string, x: string) => `$${ticker} 每小时用 ${asset} 给持有人分红${x ? `，就在 @${x}` : ""} 🐂`,
    privateBundle: "私密捆绑发币",
    devBoughtTitle: (share: string) => `创建者在创建时买入了 ${share} 的供应量`,
    noDevBuyTitle: "创建者在创建时没有买入",
    devBought: (share: string) => `开发者首买 ${share}`,
    noDevBuy: "开发者没有首买",
    candleSize: "K 线周期",
    chartOf: "单位",
    price: "价格",
    marketCap: "市值",
    chartLabel: (unit: "price" | "mcap", ticker: string) => `$${ticker} ${unit === "price" ? "价格" : "市值"} K 线图`,
    ath: (usd: string) => `历史最高市值 ${usd}`,
    hourlyPayout: "每小时持有人分红",
    tabs: { trades: "交易", holders: "持有人", payouts: "分红" },
    thWhen: "时间",
    thSide: "类型",
    thWallet: "钱包",
    thHolding: "持仓",
    thReceived: "已收到",
    thRound: "轮次",
    thPaid: "分红",
    thValue: "价值",
    thWallets: "钱包数",
    thTx: "交易",
    view: "查看 ↗",
    side: { buy: "买入", sell: "卖出" },
    noTrades: "还没有交易。第一个买家能拿到内盘上的最低价。",
    noHolders: "还没有持有人。",
    excluded: (name: string) => `${name}（不参与分红）`,
    excludedNames: { curve: "Raydium 内盘金库", pool: "Raydium 池子", launcher: "发币钱包", divvy: BRAND, burn: "已销毁" },
    na: "无",
    firstPayoutIn: (countdown: ReactNode) => <>首轮分红在 {countdown} 后</>,
    firstPayoutNote: (minHolder: string, claim: boolean) => `每小时一轮，按持仓比例${claim ? "记入" : "发给"}持有 ${minHolder} 以上的钱包。`,
    nextPayout: "下一轮分红",
    lastRound: "上一轮",
    lastRoundValue: (amount: string, asset: string, wallets: string) => `${amount} ${asset} · ${wallets} 个钱包`,
    noRoundYet: "还没有，首轮即将开始",
    paid24h: "24 小时分红",
    payoutStatus: "分红状态",
    statusLate: "延迟",
    statusCarried: "顺延到下一轮",
    curveProgress: "内盘进度",
    curveTitle: (target: string) => `内盘，达到 ${target} 后毕业`,
    graduated: "已毕业",
    estimate: (amount: ReactNode) => <>按上一轮，你约 {amount} / 小时</>,
    estimateTag: "估算",
    estimateConnect: "连接钱包后，这里会显示你按上一轮估算的分红。",
    cardNote: (minHolder: string, d: { claim: boolean; cardNoteVerb: string }) =>
      `每小时快照时持有 ${minHolder} 以上的钱包都能${d.claim ? "记入分红" : "分到"}。内盘满了以后，代币进入 Raydium 池子，分红照常。`,
    warn: "不同代币可以用同一个代币符号和名称。买入前，先和项目方公布的合约地址核对一下。",
  },
);

/** The buy/sell box (components/coin/TradeBox). */
export const tradeMsgs = defineMsgs(
  {
    lastFailed: "Your last trade failed on chain. Only the network fee was spent.",
    lastWentThrough: "Your last trade went through.",
    enterAmount: "Enter an amount like 0.5",
    demoBought: (recv: string) => `Bought ${recv} (demo)`,
    demoSold: (recv: string) => `Sold for ${recv} (demo)`,
    quoteMismatch: "The quote didn't match your slippage setting. Nothing was sent.",
    lessThanShown: (out: string, unit: string, min: string) => `You'd get about ${out} ${unit} (at least ${min}), less than shown. Continue?`,
    priceImpact: (pct: string) => `This trade moves the price by about ${pct}%. Continue?`,
    bought: (amount: string, ticker: string) => `Bought ${amount} $${ticker}`,
    sold: (sol: string) => `Sold for ${sol}`,
    tradeFailed: "The trade didn't go through. Nothing was sent.",
    buyOrSell: "Buy or sell",
    buy: "Buy",
    sell: "Sell",
    youPay: "You pay",
    youSell: "You sell",
    balanceSol: (sol: string) => `Balance ${sol} SOL`,
    balanceTokens: (amount: string, ticker: string) => `Balance ${amount} $${ticker}`,
    /** Before a wallet is connected, or when the page can't read its balance. */
    balanceUnknown: "Balance —",
    amount: "Amount",
    youReceive: "You receive",
    route: "Route",
    routeBuyPool: "SOL into the Raydium pool",
    routeBuyCurve: "SOL into the bonding curve",
    routeSellPool: "Raydium pool to SOL",
    routeSellCurve: "Bonding curve to SOL",
    tradingFee: "Trading fee",
    /** `holders` is null when holders get exactly half of the fee. */
    feeLabel: (fee: string, holders: string | null) => `${fee}%, ${holders === null ? "half of it" : `${holders} of it`} to holders`,
    maxSlippage: "Max slippage",
    connectToTrade: "Connect wallet to trade",
    confirming: "Confirming on Solana…",
    approve: "Approve in your wallet…",
    buyTicker: (ticker: string) => `Buy $${ticker}`,
    sellTicker: (ticker: string) => `Sell $${ticker}`,
    failedNote: (expired: boolean, solscan: LinkFn) => (
      <>
        {expired ? "Your last trade didn't land in time. Nothing was spent." : "Your last trade failed on chain; only the network fee was spent."}{" "}
        {solscan("See it on Solscan")}
        {expired ? ", then try again." : ". A price that moved more than your max slippage is the usual reason: try again, or raise it."}
      </>
    ),
    unconfirmedNote: (solscan: LinkFn) => (
      <>
        Your last trade was sent but isn&apos;t confirmed yet.{" "}
        {solscan("Check it on Solscan")} before you trade again.
      </>
    ),
    iChecked: "I checked it",
  },
  {
    lastFailed: "你上一笔交易在链上失败了。只花了网络手续费。",
    lastWentThrough: "你上一笔交易已成功。",
    enterAmount: "请输入金额，比如 0.5",
    demoBought: (recv: string) => `已买入 ${recv}（演示）`,
    demoSold: (recv: string) => `已卖出，得到 ${recv}（演示）`,
    quoteMismatch: "报价和你设置的滑点不符。没有发送任何交易。",
    lessThanShown: (out: string, unit: string, min: string) => `你大约会收到 ${out} ${unit}（至少 ${min}），比显示的少。继续吗？`,
    priceImpact: (pct: string) => `这笔交易会让价格变动约 ${pct}%。继续吗？`,
    bought: (amount: string, ticker: string) => `已买入 ${amount} $${ticker}`,
    sold: (sol: string) => `已卖出，得到 ${sol}`,
    tradeFailed: "交易没有成功。没有发送任何交易。",
    buyOrSell: "买入或卖出",
    buy: "买入",
    sell: "卖出",
    youPay: "你支付",
    youSell: "你卖出",
    balanceSol: (sol: string) => `余额 ${sol} SOL`,
    balanceTokens: (amount: string, ticker: string) => `余额 ${amount} $${ticker}`,
    balanceUnknown: "余额 —",
    amount: "金额",
    youReceive: "你将收到",
    route: "路径",
    routeBuyPool: "SOL 进入 Raydium 池子",
    routeBuyCurve: "SOL 进入内盘",
    routeSellPool: "Raydium 池子换成 SOL",
    routeSellCurve: "内盘换成 SOL",
    tradingFee: "交易手续费",
    feeLabel: (fee: string, holders: string | null) => `${fee}%，其中${holders === null ? "一半" : ` ${holders} `}分给持有人`,
    maxSlippage: "最大滑点",
    connectToTrade: "连接钱包后交易",
    confirming: "正在 Solana 上确认…",
    approve: "请在钱包中确认…",
    buyTicker: (ticker: string) => `买入 $${ticker}`,
    sellTicker: (ticker: string) => `卖出 $${ticker}`,
    failedNote: (expired: boolean, solscan: LinkFn) =>
      expired ? (
        <>
          你上一笔交易没能及时上链，没有花费任何资金。先{solscan("在 Solscan 上查看")}，然后重试。
        </>
      ) : (
        <>
          你上一笔交易在链上失败了，只花了网络手续费。{solscan("在 Solscan 上查看")}。最常见的原因是价格变动超过了你的最大滑点：请重试，或者调高滑点。
        </>
      ),
    unconfirmedNote: (solscan: LinkFn) => <>你上一笔交易已发送，但还没确认。再次交易之前，先{solscan("在 Solscan 上查看")}。</>,
    iChecked: "我已查看",
  },
);

/** The creator's fee card on their own coin's page (components/coin/CreatorFees). */
export const creatorFeesMsgs = defineMsgs(
  {
    claimed: "Creator fees claimed",
    claimFailed: "The claim didn't go through. Nothing was sent.",
    title: "Your creator fees",
    signInNote: "You made this coin. Sign in to see the fees its trades left you and claim them.",
    signInFailed: "Couldn't sign in. Try again.",
    signInToClaim: "Sign in to claim",
    loading: "Loading…",
    earnedOn: (ticker: string) => `Earned on $${ticker}`,
    ready: "Ready to claim, all your coins",
    claiming: "Claiming…",
    nothing: "Nothing to claim yet",
    claim: (sol: string) => `Claim ${sol}`,
    /** `seeClaim` is null until a claim landed on this page. */
    note: (share: string, seeClaim: LinkFn | null, allCoins: LinkFn) => (
      <>
        Your {share}% of every trade on the curve collects on chain in your own creator vault. Claiming sends it to this wallet.{" "}
        {seeClaim && (
          <>
            {seeClaim("See the claim")}.{" "}
          </>
        )}
        {allCoins("All your coins")}
      </>
    ),
  },
  {
    claimed: "创建者手续费已领取",
    claimFailed: "领取没有成功。没有发送任何交易。",
    title: "我的创建者手续费",
    signInNote: "这个代币是你创建的。登录后可以查看它的交易给你带来的手续费，并领取。",
    signInFailed: "登录失败，请重试。",
    signInToClaim: "登录后领取",
    loading: "加载中…",
    earnedOn: (ticker: string) => `在 $${ticker} 上赚到`,
    ready: "可领取（你的全部代币）",
    claiming: "领取中…",
    nothing: "暂时没有可领取的",
    claim: (sol: string) => `领取 ${sol}`,
    note: (share: string, seeClaim: LinkFn | null, allCoins: LinkFn) => (
      <>
        内盘上每笔交易的 {share}% 归你，在链上累积到你自己的创建者金库。领取会把它发到这个钱包。
        {seeClaim && <>{seeClaim("查看领取交易")}。</>}
        {allCoins("我的全部代币")}
      </>
    ),
  },
);

/** "Report" on a coin's page (components/coin/ReportButton). */
export const reportMsgs = defineMsgs(
  {
    thanks: "Thanks. We'll take a look.",
    failed: "The report didn't go through. Try again.",
    report: "Report",
    title: (ticker: string) => `Report $${ticker}`,
    intro: `Tell us what's wrong. Reports go to ${BRAND_LATIN}'s moderators.`,
    reason: "Reason",
    reasons: { copy: "It copies another coin", scam: "It's a scam", nsfw: "Not safe for work", illegal: "Illegal content", other: "Something else" },
    details: "Details, links (optional)",
    cancel: "Cancel",
    send: "Send report",
  },
  {
    thanks: "谢谢。我们会看一下。",
    failed: "举报没有发送成功，请重试。",
    report: "举报",
    title: (ticker: string) => `举报 $${ticker}`,
    intro: `告诉我们哪里有问题。举报会发给${BRAND}的管理员。`,
    reason: "原因",
    reasons: { copy: "仿盘，抄了别的代币", scam: "这是骗局", nsfw: "不适合公开浏览", illegal: "违法内容", other: "其他问题" },
    details: "详情、链接（选填）",
    cancel: "取消",
    send: "发送举报",
  },
);
