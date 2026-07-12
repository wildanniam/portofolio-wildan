"use client";

import { useMemo, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { MomentCategory, MomentRecord, ReadyImageAsset } from "@/content/types";

const categories: Array<{ id: "all" | MomentCategory; label: string }> = [
  { id: "all", label: "All notes" },
  { id: "build", label: "Build" },
  { id: "win", label: "Win" },
  { id: "learn", label: "Learn" },
  { id: "give", label: "Give" },
];

const categoryLabels: Record<MomentCategory, string> = {
  build: "Build",
  win: "Win",
  learn: "Learn",
  give: "Give",
};

function imageFor(moment: MomentRecord): ReadyImageAsset | undefined {
  return moment.assets.find(
    (asset): asset is ReadyImageAsset => asset.status === "ready" && asset.mediaKind === "image",
  );
}

export function PfnMomentsGallery({ moments }: { moments: MomentRecord[] }) {
  const [category, setCategory] = useState<"all" | MomentCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(
    () => moments.filter((moment) => category === "all" || moment.category === category),
    [category, moments],
  );
  const selectedIndex = filtered.findIndex((moment) => moment.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : undefined;
  const selectedImage = selected ? imageFor(selected) : undefined;

  const move = (offset: number) => {
    if (selectedIndex < 0 || filtered.length === 0) return;
    const nextIndex = (selectedIndex + offset + filtered.length) % filtered.length;
    setSelectedId(filtered[nextIndex].id);
  };

  return (
    <>
      <div aria-label="Filter moments by category" className="pfn-moment-filters" role="toolbar">
        {categories
          .filter((item) => item.id === "all" || moments.some((moment) => moment.category === item.id))
          .map((item) => (
            <button
              aria-pressed={category === item.id}
              key={item.id}
              onClick={() => setCategory(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
      </div>
      <p aria-live="polite" className="pfn-visually-hidden">
        Showing {filtered.length} moment{filtered.length === 1 ? "" : "s"}.
      </p>
      <section className="pfn-moment-grid" aria-label="Documentary moments">
        {filtered.map((moment) => {
          const asset = imageFor(moment);
          if (!asset) return null;
          return (
            <article className="pfn-moment-record" key={moment.id}>
              <button
                aria-label={`Open ${moment.title}`}
                className="pfn-moment-record__trigger"
                onClick={() => setSelectedId(moment.id)}
                type="button"
              >
                <span className="pfn-moment-record__image">
                  <Image alt={asset.alt} fill sizes="(max-width: 639px) calc(100vw - 40px), 50vw" src={asset.src} style={{ objectFit: "cover" }} />
                  <span>View frame</span>
                </span>
              </button>
              <div className="pfn-moment-record__copy">
                <span className={`pfn-category pfn-category--${moment.category}`}>{categoryLabels[moment.category]}</span>
                <h2>{moment.title}</h2>
                <p>{moment.caption}</p>
                <dl><div><dt>Event</dt><dd>{moment.event}</dd></div><div><dt>When / where</dt><dd>{moment.date} · {moment.place}</dd></div></dl>
              </div>
            </article>
          );
        })}
      </section>

      <Dialog.Root onOpenChange={(open) => !open && setSelectedId(null)} open={Boolean(selected && selectedImage)}>
        <Dialog.Portal>
          <Dialog.Overlay className="pfn-lightbox__overlay" />
          <Dialog.Content aria-describedby="pfn-lightbox-caption" className="pfn-lightbox">
            {selected && selectedImage ? (
              <>
                <div className="pfn-lightbox__topline">
                  <span>{String(selectedIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}</span>
                  <Dialog.Close aria-label="Close image" className="pfn-lightbox__close"><X aria-hidden="true" size={20} /></Dialog.Close>
                </div>
                <Dialog.Title>{selected.title}</Dialog.Title>
                <div className="pfn-lightbox__image">
                  <Image alt={selectedImage.alt} fill sizes="(max-width: 639px) 92vw, 80vw" src={selectedImage.src} style={{ objectFit: "contain" }} />
                </div>
                <div className="pfn-lightbox__footer">
                  <p id="pfn-lightbox-caption">{selected.caption}</p>
                  {filtered.length > 1 ? (
                    <div aria-label="Browse moments" className="pfn-lightbox__nav">
                      <button aria-label="Previous moment" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" size={22} /></button>
                      <button aria-label="Next moment" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" size={22} /></button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
