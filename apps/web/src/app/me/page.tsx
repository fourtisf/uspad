import type { Metadata } from "next";
import type { Stats } from "@divvy/shared";
import { MeView } from "@/components/me/MeView";
import { sharedApi } from "@/lib/server-api";
import { getMsgs } from "@/i18n/server";
import { me } from "@/i18n/msgs/me";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getMsgs(me)).metaTitle };
}

export default async function MePage() {
  // Only for the next round's countdown: the page works without it.
  const stats = await sharedApi<Stats>("/api/stats").catch(() => null);
  return <MeView nextRoundAt={stats?.nextRoundAt ?? null} />;
}
