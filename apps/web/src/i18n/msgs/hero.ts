import { defineMsgs } from "../lang";

/** The official token (TokenCa: the pill in the pool card, and its card on the home page) and the X and Telegram pills (XFollow). */
export const hero = defineMsgs(
  {
    follow: "Follow",
    followOnX: (h: string) => `Follow @${h} on X`,
    join: "Join",
    joinOnTelegram: (h: string) => `Join @${h} on Telegram`,
    officialPill: (v: string) => `Official token: ${v}`,
    caSoon: "coming soon",
    caCopied: "Contract address copied",
    copyCa: (ca: string) => `Copy contract address ${ca}`,
    officialTag: "Official token",
    officialP: (brand: string, domain: string, x: string) => `The token of ${brand}. Only trust this contract address, the one on ${domain}${x ? ` and @${x}` : ""}.`,
    buyToken: (ticker: string) => `Buy $${ticker}`,
  },
  {
    follow: "关注",
    followOnX: (h: string) => `在 X 上关注 @${h}`,
    join: "加入",
    joinOnTelegram: (h: string) => `加入 Telegram 频道 @${h}`,
    officialPill: (v: string) => `官方代币：${v}`,
    caSoon: "即将公布",
    caCopied: "合约地址已复制",
    copyCa: (ca: string) => `复制合约地址 ${ca}`,
    officialTag: "官方代币",
    officialP: (brand: string, domain: string, x: string) => `${brand}的官方代币。只认这个合约地址，以 ${domain}${x ? ` 和 @${x}` : ""} 公布的为准。`,
    buyToken: (ticker: string) => `购买 $${ticker}`,
  },
);
