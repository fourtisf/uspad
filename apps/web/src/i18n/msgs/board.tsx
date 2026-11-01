import Link from "next/link";
import { defineMsgs } from "../lang";

/** The board: hero, live card, stats, leaders, coin table and coin cards (components/board, CoinCard). */
export const board = defineMsgs(
  {
    paidThisHour: (usd: string) => `Holders paid ${usd} in stocks this hour`,
    kickIdle: "Hourly stock dividends on Solana",
    untilNext: (claim: boolean): string => (claim ? "Credited to holders every hour" : "Sent to wallets every hour"),
    h1: (
      <>
        Memecoins that pay you real <em>stock dividends</em>
        <span className="arr" aria-hidden="true">↗</span>
      </>
    ),
    lede: (paidLaunch: boolean, tail: string) => `Launch a coin${paidLaunch ? " in seconds" : " for free"}. Every trade buys the stock you picked, like NVDAx or SPYx, ${tail}`,
    createCoin: "Create a coin",
    howItWorks: "How it works",
    devBuysShown: (paidLaunch: boolean): string => (paidLaunch ? "Dev buys shown" : "Free, dev buys shown"),
    liquidityLocked: "Liquidity locked for good",
    noSniper: "No sniper in block 0",
    payoutsOnChain: "Every payout on chain",
    nextPayout: "Next payout",
    lastRound: "Last round",
    liveTick: (ticker: string, asset: string) => `$${ticker} · pays in ${asset}`,
    h24: "24h",
    dripLabel: (ticker: string) => `$${ticker} holders got`,
    liveEmptyH: "No coin is live yet",
    liveEmptyP: "Launch the first one. Its holders get the first payout.",
    noCoins: "No coins yet. Be the first to launch one.",
    paidToHolders: "Paid to holders",
    traded24h: "Traded in 24h",
    coinsLive: "Coins live",
    stocksToEarn: "Stocks to earn",
    leadersH: "Paying the most today",
    leadersP: "Ranked by what holders were paid in the last 24 hours.",
    paidToday: "Paid today",
    curveShort: (pct: string) => `Curve ${pct}`,
    noChart: "New coin, no chart yet",
    colCoin: "Coin",
    colMcap: "Market cap",
    col24h: "24h",
    colCurve: "Bonding curve",
    colPays: "Pays in",
    colPaid: "Paid out",
    colHolders: "Holders",
    colAge: "Age",
    ageShort: (ago: string) => ago.replace(/ ago$/, ""),
    allCoins: "All coins",
    sort: "Sort",
    sorts: { trending: "Trending", new: "New", payers: "Top payers", graduate: "About to graduate" },
    filterByStock: "Filter by stock",
    paysIn: "Pays in",
    all: "All",
    noMatch: (q: string) => (
      <>
        No coin matches “{q}”. Try a ticker, a name, a CA or a stock like NVDAx, or <Link className="link" href="/create">create it yourself</Link>.
      </>
    ),
    badgeNew: "New",
    badgeGraduated: "Graduated",
    devBadge: (share: string) => `Dev ${share}`,
    devBadgeTitle: (share: string) => `The creator bought ${share} of the supply in the create`,
    agoBy: (ago: string, creator: string) => `${ago} by ${creator}`,
    paidOut: "Paid out",
    holders: "holders",
  },
  {
    paidThisHour: (usd: string) => `本小时已发 ${usd} 美股`,
    kickIdle: "每小时美股分红 · Solana",
    untilNext: (claim: boolean) => (claim ? "每小时自动记入持有人" : "每小时自动发到钱包"),
    h1: (
      <>
        土狗也分红，
        <br />
        分的是<em>美股</em>
        <span className="arr" aria-hidden="true">↗</span>
      </>
    ),
    lede: (paidLaunch: boolean, tail: string) => `${paidLaunch ? "几秒钟就能发币。" : "免费发币。"}每一笔交易都会买入你选的股票代币，比如 NVDAx、SPYx，${tail}`,
    createCoin: "创建代币",
    howItWorks: "玩法说明",
    devBuysShown: (paidLaunch: boolean) => (paidLaunch ? "开发者首买公开" : "免费发币，开发者首买公开"),
    liquidityLocked: "流动性永久锁定",
    noSniper: "0 号区块无狙击",
    payoutsOnChain: "每笔分红链上可查",
    nextPayout: "下一轮分红",
    lastRound: "上一轮",
    liveTick: (ticker: string, asset: string) => `$${ticker} · 分红 ${asset}`,
    h24: "24 小时",
    dripLabel: (ticker: string) => `$${ticker} 持有人领到`,
    liveEmptyH: "还没有代币上线",
    liveEmptyP: "发第一个代币，它的持有人领第一笔分红。",
    noCoins: "还没有代币。来发第一个吧。",
    paidToHolders: "累计分红",
    traded24h: "24 小时交易额",
    coinsLive: "在线代币",
    stocksToEarn: "可分红股票",
    leadersH: "今日分红最多",
    leadersP: "按过去 24 小时持有人所得排名。",
    paidToday: "今日已分",
    curveShort: (pct: string) => `内盘 ${pct}`,
    noChart: "新币，暂无走势",
    colCoin: "代币",
    colMcap: "市值",
    col24h: "24h",
    colCurve: "内盘进度",
    colPays: "分红资产",
    colPaid: "已分红",
    colHolders: "持有人",
    colAge: "上线",
    ageShort: (ago: string) => ago.replace(/前$/, ""),
    allCoins: "全部代币",
    sort: "排序",
    sorts: { trending: "热门", new: "最新", payers: "分红最多", graduate: "即将毕业" },
    filterByStock: "按股票筛选",
    paysIn: "分红资产",
    all: "全部",
    noMatch: (q: string) => (
      <>
        没有匹配“{q}”的代币。试试代币符号、名称、合约地址或股票（比如 NVDAx），或者<Link className="link" href="/create">自己创建一个</Link>。
      </>
    ),
    badgeNew: "新币",
    badgeGraduated: "已毕业",
    devBadge: (share: string) => `首买 ${share}`,
    devBadgeTitle: (share: string) => `创建者在创建时买入了 ${share} 的供应量`,
    agoBy: (ago: string, creator: string) => `${ago} · ${creator} 创建`,
    paidOut: "已分红",
    holders: "持有人",
  },
);
