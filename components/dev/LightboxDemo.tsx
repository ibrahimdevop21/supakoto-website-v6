"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";

const FRAMES = ["A", "B", "C"];

export function LightboxDemo({
  labels,
}: {
  labels: {
    open: string;
    close: string;
    prev: string;
    next: string;
    caption: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        {labels.open}
      </Button>
      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        onPrev={() => setIndex((i) => (i + FRAMES.length - 1) % FRAMES.length)}
        onNext={() => setIndex((i) => (i + 1) % FRAMES.length)}
        labels={labels}
      >
        <figure className="rounded-card border border-ink-700 bg-ink-900 p-2">
          <div className="flex aspect-video w-[70vw] max-w-3xl items-center justify-center bg-ink-800">
            <span className="font-display text-display text-fg-subtle">
              {FRAMES[index]}
            </span>
          </div>
          <figcaption className="p-3 text-small text-fg-muted">
            {labels.caption} — {index + 1}/{FRAMES.length}
          </figcaption>
        </figure>
      </Lightbox>
    </>
  );
}
