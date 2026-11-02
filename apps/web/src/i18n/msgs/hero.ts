import { defineMsgs } from "../lang";

/** The hero's pills (XFollow, TelegramJoin, TokenCa). */
export const hero = defineMsgs(
  {
    follow: "Follow",
    followOnX: (h: string) => `Follow @${h} on X`,
    join: "Join",
    joinOnTelegram: (h: string) => `Join @${h} on Telegram`,
    caSoon: "coming soon",
    caCopied: "Contract address copied",
    copyCa: (ca: string) => `Copy contract address ${ca}`,
    officialTag: "Official token",
    officialP: (brand: string) => `The token of ${brand}. Only trust this contract address, the one on ${brand}.ai and @HwaiPad.`,
    tradeOn: (where: string) => `Trade on ${where}`,
  },
  {
    follow: "关注",
    followOnX: (h: string) => `在 X 上关注 @${h}`,
    join: "加入",
    joinOnTelegram: (h: string) => `加入 Telegram 频道 @${h}`,
    caSoon: "即将公布",
    caCopied: "合约地址已复制",
    copyCa: (ca: string) => `复制合约地址 ${ca}`,
    officialTag: "官方代币",
    officialP: (brand: string) => `${brand} 的官方代币。只认这个合约地址，以 ${brand}.ai 和 @HwaiPad 公布的为准。`,
    tradeOn: (where: string) => `去 ${where} 交易`,
  },
);
