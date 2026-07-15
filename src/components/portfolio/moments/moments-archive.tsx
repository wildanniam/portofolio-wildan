"use client";

import { useMemo, useRef, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";

import type { MomentCategory, MomentRecord, ReadyImageAsset } from "@/content/types";

import { ResponsiveMedia } from "../media/responsive-media";

const categories: Array<{ id: "all" | MomentCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "build", label: "Build rooms" },
  { id: "win", label: "Outcomes" },
  { id: "learn", label: "Learning" },
  { id: "give", label: "Giving" },
];

const preferredOrder = [
  "refactory-build-room",
  "fradium-wchl-team",
  "self-healing-research",
  "learning-in-public",
  "nova-lisk-team",
  "specheal-refactory-team",
  "serambi-bank-indonesia",
];

function orderMoments(moments: MomentRecord[]) {
  const rank = new Map(preferredOrder.map((id, index) => [id, index]));
  return [...moments].sort(
    (left, right) =>
      (rank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
      right.date.localeCompare(left.date),
  );
}

function momentImage(moment: MomentRecord) {
  return moment.assets.find(
    (asset): asset is ReadyImageAsset =>
      asset.status === "ready" && asset.mediaKind === "image",
  );
}

function MomentCard({
  index,
  moment,
  onOpen,
}: {
  index: number;
  moment: MomentRecord;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const asset = momentImage(moment);
  if (!asset) return null;

  return (
    <article className={`v4-moment-card v4-moment-card--${index === 0 ? "featured" : moment.mode}`} data-moment={moment.id}>
      <button
        aria-label={`Open ${moment.title}`}
        className="v4-moment-card__trigger"
        onClick={(event) => onOpen(event.currentTarget)}
        type="button"
      >
        <ResponsiveMedia
          asset={asset}
          className="v4-moment-card__media"
          fit="cover"
          priority={index === 0}
          sizes={index === 0 ? "(max-width: 767px) calc(100vw - 40px), 66vw" : "(max-width: 767px) 54vw, 30vw"}
        />
        <span className="v4-moment-card__open">Open frame <ArrowUpRight aria-hidden="true" size={15} /></span>
      </button>
      <div className="v4-moment-card__copy">
        <p className="v4-moment-card__index">{String(index + 1).padStart(2, "0")}</p>
        <p className="v4-moment-card__context">{moment.category} · {moment.event}</p>
        <h2>{moment.title}</h2>
        <p className="v4-moment-card__caption">{moment.caption}</p>
        <dl>
          <div><dt>Place</dt><dd>{moment.place}</dd></div>
          <div><dt>Date</dt><dd>{moment.date}</dd></div>
        </dl>
      </div>
    </article>
  );
}

export function MomentsArchive({ moments }: { moments: MomentRecord[] }) {
  const [category, setCategory] = useState<"all" | MomentCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const ordered = useMemo(() => orderMoments(moments), [moments]);
  const visible = useMemo(
    () => ordered.filter((moment) => category === "all" || moment.category === category),
    [category, ordered],
  );
  const selectedIndex = visible.findIndex((moment) => moment.id === selectedId);
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : undefined;
  const selectedImage = selected ? momentImage(selected) : undefined;
  const selectedLightboxImage = selectedImage
    ? { ...selectedImage, mobile: undefined }
    : undefined;

  const move = (offset: number) => {
    if (selectedIndex < 0 || !visible.length) return;
    const next = (selectedIndex + offset + visible.length) % visible.length;
    setSelectedId(visible[next].id);
  };

  return (
    <>
      <div aria-label="Filter documentary moments" className="v4-moment-filters" role="toolbar">
        {categories
          .filter((item) => item.id === "all" || moments.some((moment) => moment.category === item.id))
          .map((item) => (
            <button
              aria-pressed={category === item.id}
              key={item.id}
              onClick={() => {
                setCategory(item.id);
                setSelectedId(null);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
      </div>
      <p aria-live="polite" className="portfolio-visually-hidden">Showing {visible.length} moments.</p>
      <section aria-label="Documentary moment archive" className="v4-moments-grid">
        {visible.map((moment, index) => (
          <MomentCard
            index={index}
            key={moment.id}
            moment={moment}
            onOpen={(trigger) => {
              triggerRef.current = trigger;
              setSelectedId(moment.id);
            }}
          />
        ))}
      </section>

      <Dialog.Root onOpenChange={(open) => !open && setSelectedId(null)} open={Boolean(selected && selectedLightboxImage)}>
        <Dialog.Portal>
          <Dialog.Overlay className="v4-lightbox__overlay" />
          <Dialog.Content
            aria-modal="true"
            className="v4-lightbox"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              triggerRef.current?.focus();
            }}
          >
            {selected && selectedLightboxImage ? (
              <>
                <div className="v4-lightbox__topline">
                  <span>{String(selectedIndex + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}</span>
                  <Dialog.Close aria-label="Close image"><X aria-hidden="true" size={20} /></Dialog.Close>
                </div>
                <div className="v4-lightbox__layout">
                  <ResponsiveMedia
                    asset={selectedLightboxImage}
                    className="v4-lightbox__media"
                    fit="contain"
                    sizes="(max-width: 767px) 92vw, 64vw"
                  />
                  <div className="v4-lightbox__copy">
                    <p>{selected.category} / {selected.event}</p>
                    <Dialog.Title>{selected.title}</Dialog.Title>
                    <Dialog.Description>{selected.caption}</Dialog.Description>
                    <p>{selected.reflection}</p>
                    <dl>
                      <div><dt>Date</dt><dd>{selected.date}</dd></div>
                      <div><dt>Place</dt><dd>{selected.place}</dd></div>
                      {selected.result ? <div><dt>Result</dt><dd>{selected.result}</dd></div> : null}
                    </dl>
                  </div>
                </div>
                {visible.length > 1 ? (
                  <div className="v4-lightbox__nav">
                    <button aria-label="Previous moment" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" size={20} />Previous</button>
                    <button aria-label="Next moment" onClick={() => move(1)} type="button">Next<ChevronRight aria-hidden="true" size={20} /></button>
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
