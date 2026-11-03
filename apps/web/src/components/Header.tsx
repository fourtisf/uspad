"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { short } from "@divvy/shared";
import { prefersReducedMotion } from "@/lib/hooks";
import { useLang, useMsgs } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";
import { Icon } from "./Icon";
import { Mark, Wordmark } from "./Mark";
import { useToast } from "./Toasts";

/** Which nav item a path belongs to (prototype `route` nav map: a coin's page belongs to home). */
export function navOf(path: string): "board" | "payouts" | "how" | "create" | "me" {
  const seg = path.split("/")[1] ?? "";
  if (seg === "payouts" || seg === "how" || seg === "create" || seg === "me") return seg;
  return "board";
}

/*
 * The coin search lives in the home page's "All coins" section (prototype `#all`). The header's search
 * button and the "/" key bring it up from any page: on another page they go home and leave this flag for
 * the board, which takes it when it mounts.
 */
let findPending = false;

/** Scrolls to the home page's coin search and focuses it; false when it isn't on the page. */
export function focusCoinSearch(smooth = true): boolean {
  const sec = document.getElementById("all");
  const input = document.getElementById("search");
  if (!sec || !(input instanceof HTMLInputElement)) return false;
  sec.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto", block: "start" });
  input.focus({ preventScroll: true });
  return true;
}

/** For the board: whether the header asked for the coin search before navigating home (and clears it). */
export function takeCoinSearchRequest(): boolean {
  const v = findPending;
  findPending = false;
  return v;
}

export function ConnectButton() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const { setVisible } = useWalletModal();
  const toast = useToast();
  const t = useMsgs(common);
  const was = useRef(connected);
  useEffect(() => {
    if (connected !== was.current) toast(connected ? t.walletConnected : t.walletDisconnected);
    was.current = connected;
  }, [connected, toast, t]);
  const addr = publicKey?.toBase58();
  return (
    <button
      className="btn btn-ghost connectb"
      id="connectBtn"
      type="button"
      aria-label={addr ? t.yourWallet : t.connectWallet}
      onClick={() => (addr ? router.push("/me") : setVisible(true))}
    >
      <Icon name="wallet" size={18} />
      {addr ? short(addr) : t.connectWallet}
    </button>
  );
}

/** 中 / EN: the language for the whole site, kept in a cookie. */
export function LangSwitch() {
  const [lang, setLang] = useLang();
  const t = useMsgs(common);
  return (
    <div className="lang" role="group" aria-label={t.language}>
      <button type="button" lang="zh-CN" aria-pressed={lang === "zh"} onClick={() => lang !== "zh" && setLang("zh")}>中</button>
      <i aria-hidden="true">/</i>
      <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => lang !== "en" && setLang("en")}>EN</button>
    </div>
  );
}

/** The top bar (prototype `header.top`): the brand, the nav as a centred pill, search, language, wallet, create. */
export function Header() {
  const t = useMsgs(common);
  const path = usePathname();
  const router = useRouter();
  const nav = navOf(path);

  const findCoins = useCallback(() => {
    if (path === "/" && focusCoinSearch()) return;
    findPending = true;
    router.push("/");
  }, [path, router]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const tag = (el?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || (el instanceof HTMLElement && el.isContentEditable)) return;
      e.preventDefault();
      findCoins();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [findCoins]);

  const cur = (k: string) => (nav === k ? { "aria-current": "page" as const } : {});
  return (
    <header className="top">
      <div className="wrap">
        <Link className="brand" href="/" aria-label={t.home}>
          <Mark size={38} />
          <Wordmark />
        </Link>
        <nav className="navpill" aria-label={t.navMain}>
          <Link href="/" {...cur("board")}>{t.navBoard}</Link>
          <Link href="/payouts" {...cur("payouts")}>{t.navPayouts}</Link>
          <Link href="/how" {...cur("how")}>{t.navHow}</Link>
        </nav>
        <div className="tr">
          <button className="icb" type="button" aria-label={t.searchLabel} aria-keyshortcuts="/" onClick={findCoins}>
            <Icon name="search" size={19} />
          </button>
          <LangSwitch />
          <ConnectButton />
          <Link className="btn btn-acc createb" href="/create">{t.createCoin}</Link>
        </div>
      </div>
    </header>
  );
}
