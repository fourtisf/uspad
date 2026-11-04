import Link from "next/link";
import type { ReactNode } from "react";
import { defineMsgs } from "../lang";

/** The home page: the round's pool, the payout feed, stats, featured coins, all coins and the coin cards (components/board, CoinCard). */
export const board = defineMsgs(
  {
    /** The page's heading: read by screen readers, and shown in the pool card until the first coin. */
    h1: "Memecoins that pay you real stock dividends",
    kickIdle: "Hourly stock dividends on Solana",
    lede: (paidLaunch: boolean, tail: string) => `Launch a coin${paidLaunch ? " in seconds" : " for free"}. Every trade buys the stock you picked, like NVDAx or SPYx, ${tail}`,
    poolLabel: "This round's pool",
    poolAt: (time: string, claim: boolean) => (claim ? `credited at ${time}` : `paid at ${time}`),
    poolP: (countdown: ReactNode, claim: boolean) => (
      <>
        Every trade buys the stock you picked, like NVDAx or SPYx. In <b className="n">{countdown}</b> it&apos;s {claim ? "credited to" : "split between"} all holders by how much they hold.
      </>
    ),
    createCoin: "Create a coin",
    howItWorks: "How it works",
    feedH: "Just paid",
    feedAll: "All payouts →",
    feedHolders: (ticker: string) => `$${ticker} holders`,
    feedWallets: (n: number) => (n === 1 ? "1 wallet" : `${n.toLocaleString("en-US")} wallets`),
    feedEmptyH: "No payouts yet",
    feedEmptyP: "Rounds run every hour. Payouts show up here as they land.",
    liveEmptyH: "No coin is live yet",
    liveEmptyP: "Launch the first one. Its holders get the first payout.",
    paidToHolders: "Paid to holders",
    traded24h: "Traded in 24h",
    coinsLive: "Coins live",
    stocksToEarn: "Stocks to earn",
    devBuysShown: (paidLaunch: boolean): string => (paidLaunch ? "Dev buys shown" : "Free, dev buys shown"),
    liquidityLocked: "Liquidity locked for good",
    noSniper: "No sniper in block 0",
    payoutsOnChain: "Every payout on chain",
    leadersH: "Featured",
    leadersP: "Ranked by what holders were paid in the last 24 hours",
    topPayer: "No. 1 · paid the most in 24h",
    mcap24h: "Market cap · 24h",
    boxPays: "Pays in",
    boxPaid24h: "Paid in 24h",
    boxHolders: "Holders",
    allCoins: "All coins",
    liveMarkets: "Live markets",
    cols: { rank: "#", coin: "Coin", mcap: "Market cap", chg: "24h", curve: "Curve", chart: "Chart", pays: "Pays" },
    sort: "Sort",
    sorts: { trending: "Trending", new: "New", payers: "Top payers", graduate: "About to graduate" },
    filterByStock: "Filter by dividend stock",
    all: "All",
    more: "Show more",
    noMatchH: (q: string) => (q ? `Nothing matches “${q}”` : "No coins found"),
    noMatchP: (
      <>
        Try a ticker, a name, a CA or a stock like NVDAx, or <Link href="/create">create it yourself</Link>.
      </>
    ),
    noCoinsH: "No coins yet",
    noCoinsP: "Be the first to launch one.",
    // Coin cards (CoinCard)
    mcapLabel: (rest: string) => `Market cap · ${rest}`,
    curve: "Curve",
    paid24h: (usd: string) => `Paid ${usd} in 24h`,
    paidTotal: (usd: string) => `Paid ${usd}`,
    firstRound: (countdown: ReactNode) => <>First round in {countdown}</>,
    noChart: "New coin, no chart yet",
    badgeGraduated: "Graduated",
    devBadge: (share: string) => `Dev ${share}`,
    devBadgeTitle: (share: string) => `The creator bought ${share} of the supply in the create`,
    agoBy: (ago: string, creator: string) => `${ago} by ${creator}`,
  },
  {
    h1: "土狗也分红，分的是美股",
    kickIdle: "每小时美股分红 · Solana",
    lede: (paidLaunch: boolean, tail: string) => `${paidLaunch ? "几秒钟就能发币。" : "免费发币。"}每一笔交易都会买入你选的股票代币，比如 NVDAx、SPYx，${tail}`,
    poolLabel: "本轮分红池",
    poolAt: (time: string, claim: boolean) => (claim ? `${time} 记入` : `${time} 发放`),
    poolP: (countdown: ReactNode, claim: boolean) => (
      <>
        每一笔交易都会买入你选的股票代币，比如 NVDAx、SPYx。<b className="n">{countdown}</b> 后按持仓比例{claim ? "记入" : "发给"}所有持有人。
      </>
    ),
    createCoin: "创建代币",
    howItWorks: "玩法说明",
    feedH: "刚刚到账",
    feedAll: "分红记录 →",
    feedHolders: (ticker: string) => `$${ticker} 持有人`,
    feedWallets: (n: number) => `${n.toLocaleString("en-US")} 个钱包`,
    feedEmptyH: "还没有分红到账",
    feedEmptyP: "每小时一轮，到账后会显示在这里。",
    liveEmptyH: "还没有代币上线",
    liveEmptyP: "发第一个代币，它的持有人领第一笔分红。",
    paidToHolders: "累计分红",
    traded24h: "24 小时交易额",
    coinsLive: "在线代币",
    stocksToEarn: "可分红股票",
    devBuysShown: (paidLaunch: boolean) => (paidLaunch ? "开发者首买公开" : "免费发币，开发者首买公开"),
    liquidityLocked: "流动性永久锁定",
    noSniper: "0 号区块无狙击",
    payoutsOnChain: "每笔分红链上可查",
    leadersH: "精选",
    leadersP: "按过去 24 小时持有人所得排名",
    topPayer: "№1 · 24 小时分红最多",
    mcap24h: "市值 · 24 小时",
    boxPays: "分红股票",
    boxPaid24h: "24 小时分红",
    boxHolders: "持有人",
    allCoins: "全部代币",
    liveMarkets: "在线行情",
    cols: { rank: "#", coin: "代币", mcap: "市值", chg: "24h", curve: "内盘", chart: "走势", pays: "分红" },
    sort: "排序",
    sorts: { trending: "热门", new: "最新", payers: "分红最多", graduate: "即将毕业" },
    filterByStock: "按分红股票筛选",
    all: "全部",
    more: "查看更多",
    noMatchH: (q: string) => (q ? `没有找到“${q}”` : "没有找到代币"),
    noMatchP: (
      <>
        换个名称、代币符号、合约地址或股票（比如 NVDAx）试试，或者<Link href="/create">自己创建一个</Link>。
      </>
    ),
    noCoinsH: "还没有代币",
    noCoinsP: "来发第一个吧。",
    mcapLabel: (rest: string) => `市值 · ${rest}`,
    curve: "内盘",
    paid24h: (usd: string) => `24h 分红 ${usd}`,
    paidTotal: (usd: string) => `已分红 ${usd}`,
    firstRound: (countdown: ReactNode) => <>首轮 {countdown}</>,
    noChart: "新币，暂无走势",
    badgeGraduated: "已毕业",
    devBadge: (share: string) => `首买 ${share}`,
    devBadgeTitle: (share: string) => `创建者在创建时买入了 ${share} 的供应量`,
    agoBy: (ago: string, creator: string) => `${ago} · ${creator} 创建`,
  },
);
