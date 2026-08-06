"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Autoplaying documentary embed. Browsers only allow MUTED autoplay, so we
 * start muted and surface our own unmute button driven by the YouTube
 * IFrame API (postMessage commands — no SDK needed). Quality is
 * YouTube-adaptive and cannot be forced; the full-width player biases it
 * toward HD and viewers keep the player's own quality picker.
 */
export function DocumentaryPlayer({ videoId }: { videoId: string }) {
  const t = useTranslations("about.documentary");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);

  const command = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  };

  const unmute = () => {
    command("unMute");
    command("setVolume", [100]);
    setMuted(false);
  };

  return (
    <div className="relative mt-8 aspect-video overflow-hidden rounded-card border border-ink-700">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1`}
        title={t("title")}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
      {muted && (
        <button
          type="button"
          onClick={unmute}
          className="absolute bottom-4 start-4 flex items-center gap-2 rounded-card border border-ink-700 bg-ink-950/85 px-4 py-2.5 text-small font-medium text-fg backdrop-blur transition-colors hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
          </svg>
          {t("unmute")}
        </button>
      )}
    </div>
  );
}
