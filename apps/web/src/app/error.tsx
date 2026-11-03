"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { useMsgs } from "@/i18n/client";
import { common } from "@/i18n/msgs/common";

/** Any page that throws (e.g. the API is down) shows this instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useMsgs(common);
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="page">
      <Link className="back" href="/"><Icon name="back" size={16} />{t.backToBoard}</Link>
      <div className="card empty status-card" role="alert">
        <b>{t.errorLoading}</b>
        <button className="btn btn-acc" type="button" onClick={reset}>{t.tryAgain}</button>
      </div>
    </div>
  );
}
