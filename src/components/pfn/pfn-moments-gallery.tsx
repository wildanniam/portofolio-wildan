"use client";

import { useMemo, useRef, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { MomentCategory, MomentRecord } from "@/content/types";

import { PfnMedia } from "./pfn-media";
import { momentPrimaryImage } from "./pfn-models";

const categories: Array<{ id: "all" | MomentCategory; label: string }> = [
  { id: "all", label: "All moments" },
  { id: "build", label: "Build" },
  { id: "win", label: "Wins" },
  { id: "learn", label: "Learning" },
  { id: "give", label: "Giving" },
];

export function PfnMomentsGallery({ moments }: { moments: MomentRecord[] }) {
  const [category, setCategory] = useState<"all" | MomentCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const filtered = useMemo(
    () => moments.filter((moment) => category === "all" || moment.category === category),
    [category, moments],
  );
  const selectedIndex = filtered.findIndex((moment) => moment.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : undefined;
  const selectedImage = selected ? momentPrimaryImage(selected) : undefined;

  const move = (offset: number) => {
    if (selectedIndex < 0 || filtered.length === 0) return;
    const nextIndex = (selectedIndex + offset + filtered.length) % filtered.length;
    setSelectedId(filtered[nextIndex].id);
  };

  const changeCategory = (next: "all" | MomentCategory) => {
    setSelectedId(null);
    setCategory(next);
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
              onClick={() => changeCategory(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
      </div>
      <p aria-live="polite" className="pfn-visually-hidden">
        Showing {filtered.length} moment{filtered.length === 1 ? "" : "s"}.
      </p>

      <section aria-label="Documentary moments" className="pfn-moments-archive">
        {filtered.map((moment) => {
          const asset = momentPrimaryImage(moment);
          if (!asset) return null;
          return (
            <article
              className={`pfn-moment-record pfn-moment-record--${moment.mode}`}
              data-moment={moment.id}
              key={moment.id}
            >
              <button
                aria-label={`Open ${moment.title}`}
                className="pfn-moment-record__trigger"
                onClick={(event) => {
                  lastTriggerRef.current = event.currentTarget;
                  setSelectedId(moment.id);
                }}
                type="button"
              >
                <span className="pfn-moment-record__image">
                  <PfnMedia
                    asset={asset}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 42vw"
                  />
                  <span>Open frame</span>
                </span>
              </button>
              <div className="pfn-moment-record__copy">
                <p>{moment.category}</p>
                <h2>{moment.title}</h2>
                <p>{moment.caption}</p>
                <dl>
                  <div><dt>Event</dt><dd>{moment.event}</dd></div>
                  <div><dt>When</dt><dd>{moment.date}</dd></div>
                  <div><dt>Where</dt><dd>{moment.place}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
      </section>

      <Dialog.Root onOpenChange={(open) => !open && setSelectedId(null)} open={Boolean(selected && selectedImage)}>
        <Dialog.Portal>
          <Dialog.Overlay className="pfn-lightbox__overlay" />
          <Dialog.Content
            className="pfn-lightbox"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              lastTriggerRef.current?.focus();
            }}
          >
            {selected && selectedImage ? (
              <>
                <div className="pfn-lightbox__topline">
                  <span>{String(selectedIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}</span>
                  <Dialog.Close aria-label="Close image" className="pfn-lightbox__close">
                    <X aria-hidden="true" size={20} />
                  </Dialog.Close>
                </div>
                <div className="pfn-lightbox__layout">
                  <div className="pfn-lightbox__image">
                    <PfnMedia asset={selectedImage} fit="contain" sizes="(max-width: 639px) 92vw, 68vw" />
                  </div>
                  <div className="pfn-lightbox__copy">
                    <p>{selected.category}</p>
                    <Dialog.Title>{selected.title}</Dialog.Title>
                    <Dialog.Description>{selected.caption}</Dialog.Description>
                    <p>{selected.reflection}</p>
                    <dl>
                      <div><dt>Event</dt><dd>{selected.event}</dd></div>
                      <div><dt>Date</dt><dd>{selected.date}</dd></div>
                      <div><dt>Place</dt><dd>{selected.place}</dd></div>
                      {selected.result ? <div><dt>Result</dt><dd>{selected.result}</dd></div> : null}
                    </dl>
                  </div>
                </div>
                {filtered.length > 1 ? (
                  <div aria-label="Browse moments" className="pfn-lightbox__nav">
                    <button aria-label="Previous moment" onClick={() => move(-1)} type="button">
                      <ChevronLeft aria-hidden="true" size={22} />
                      Previous
                    </button>
                    <button aria-label="Next moment" onClick={() => move(1)} type="button">
                      Next
                      <ChevronRight aria-hidden="true" size={22} />
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
