import * as React from "react";

export function HeroSceneFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_42%,rgba(115,231,255,0.27),transparent_30%),radial-gradient(circle_at_76%_54%,rgba(255,209,102,0.12),transparent_23%),radial-gradient(circle_at_84%_58%,rgba(158,255,201,0.1),transparent_29%),radial-gradient(circle_at_18%_22%,rgba(255,122,89,0.06),transparent_24%)]" />
      <div className="absolute inset-0 opacity-55 [background:radial-gradient(circle,rgba(159,239,255,0.5)_1px,transparent_1.7px),radial-gradient(circle,rgba(255,209,102,0.3)_1px,transparent_1.7px)] [background-position:18px_42px,90px_24px] [background-size:170px_150px,260px_220px]" />
      <div className="absolute inset-0 opacity-30 [background:linear-gradient(90deg,rgba(115,231,255,0.028)_1px,transparent_1px),linear-gradient(rgba(158,255,201,0.018)_1px,transparent_1px)] [background-size:128px_128px]" />

      <div className="absolute right-[-18%] top-[30%] h-[30rem] w-[30rem] rounded-full border border-[color:var(--signal-cyan)]/14 shadow-[0_0_90px_rgba(115,231,255,0.12)] max-lg:right-[-72%] max-lg:top-[37%] max-lg:h-[24rem] max-lg:w-[24rem]" />
      <div className="absolute right-[9%] top-[31%] h-[29rem] w-[44rem] rotate-[-9deg] rounded-full border border-[color:var(--signal-cyan)]/20 max-lg:right-[-67%] max-lg:top-[40%] max-lg:h-[19rem] max-lg:w-[30rem]" />
      <div className="absolute right-[7%] top-[36%] h-[23rem] w-[40rem] rotate-[13deg] rounded-full border border-[color:var(--signal-mint)]/16 max-lg:right-[-72%] max-lg:top-[42%] max-lg:h-[17rem] max-lg:w-[28rem]" />
      <div className="absolute right-[15%] top-[43%] h-[15rem] w-[27rem] rotate-[-31deg] rounded-full border border-[color:var(--signal-amber)]/14 max-lg:right-[-55%] max-lg:top-[47%] max-lg:h-[13rem] max-lg:w-[22rem]" />

      <div className="absolute right-[25%] top-[39%] grid size-72 place-items-center rounded-full border border-[color:var(--signal-cyan)]/12 bg-[radial-gradient(circle,rgba(255,209,102,0.24),rgba(255,122,89,0.12)_34%,rgba(115,231,255,0.08)_56%,transparent_70%)] shadow-[0_0_120px_rgba(255,209,102,0.14),0_0_160px_rgba(115,231,255,0.12)] max-lg:right-[-18%] max-lg:top-[44%] max-lg:size-56">
        <div className="absolute size-[18rem] animate-pulse rounded-full border border-[color:var(--signal-cyan)]/10 max-lg:size-[14rem]" />
        <div className="size-40 rounded-full border border-white/10 bg-[radial-gradient(circle_at_42%_38%,rgba(255,255,255,0.38),rgba(255,209,102,0.3)_24%,rgba(255,122,89,0.12)_55%,transparent_72%)] shadow-[0_0_70px_rgba(255,209,102,0.18)] max-lg:size-32" />
        <span className="absolute h-px w-56 rotate-[-12deg] rounded-full bg-gradient-to-r from-transparent via-[color:var(--signal-cyan)]/32 to-transparent max-lg:w-44" />
        <span className="absolute h-px w-48 rotate-[38deg] rounded-full bg-gradient-to-r from-transparent via-[color:var(--signal-amber)]/22 to-transparent max-lg:w-36" />
      </div>

      <div className="absolute right-[4%] top-[34%] h-[27rem] w-[42rem] opacity-55 max-lg:right-[-78%] max-lg:top-[43%] max-lg:h-[19rem] max-lg:w-[30rem]">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-px rounded-full bg-gradient-to-r from-transparent via-[color:var(--signal-cyan)]/45 to-transparent"
            style={{
              left: `${index % 3 === 0 ? 10 : 0}%`,
              right: `${index % 2 === 0 ? 0 : 14}%`,
              top: `${18 + index * 7}%`,
              opacity: 0.18 + (index % 3) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="absolute right-[16%] top-[42%] hidden h-[21rem] w-[36rem] opacity-35 lg:block">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-px rounded-full bg-gradient-to-r from-transparent via-white/24 to-transparent"
            style={{
              left: `${index * 8}%`,
              right: `${18 - index * 3}%`,
              top: `${24 + index * 13}%`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[color:var(--void)] via-[color:var(--void)]/96 to-transparent max-md:w-full max-md:from-[color:var(--void)]/98 max-md:via-[color:var(--void)]/94 max-md:to-[color:var(--void)]/74" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[color:var(--void)] via-[color:var(--void)]/76 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--void)]/84 to-transparent" />
    </div>
  );
}
