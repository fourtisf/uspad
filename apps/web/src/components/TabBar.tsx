"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMsgs } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";
import { Icon } from "./Icon";
import { navOf } from "./Header";

/**
 * The floating dock on phones and tablets (prototype `nav.dock`, shown under 1000px): home, payouts, how it
 * works, me, and the create button. A coin's page has its own buy and sell bar there on phones, so the dock
 * steps aside (prototype `body.v-coin .dock`).
 */
export function TabBar() {
  const path = usePathname();
  const nav = navOf(path);
  const t = useMsgs(common);
  const cur = (k: string) => (nav === k ? { "aria-current": "page" as const } : {});
  return (
    <nav className={"dock" + (path.startsWith("/coin/") ? " on-coin" : "")} aria-label={t.navDock}>
      <Link href="/" {...cur("board")}>
        <Icon name="home" size={21} />
        {t.tabBoard}
      </Link>
      <Link href="/payouts" {...cur("payouts")}>
        <Icon name="gift" size={21} />
        {t.tabPayouts}
      </Link>
      <Link href="/how" {...cur("how")}>
        <Icon name="book" size={21} />
        {t.tabHow}
      </Link>
      <Link href="/me" {...cur("me")}>
        <Icon name="me" size={21} />
        {t.tabMe}
      </Link>
      {/* Never marked current: the prototype's current-item grey would cover its gold. */}
      <Link className="plus" href="/create" aria-label={t.createCoin}>
        <Icon name="plus" size={24} />
      </Link>
    </nav>
  );
}
