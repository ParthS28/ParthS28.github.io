import React from "react";
import timelineData from "../data/timeline.json";

export default function Timeline() {
  const { title, description, entries } = timelineData;

  return (
    <section className="bg-transparent text-[var(--text)] py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-center text-4xl font-bold mb-3 text-[var(--color7)]">
          {title}
        </h2>

        {description && (
          <p className="text-center mb-16 max-w-3xl mx-auto text-[var(--color7)]">
            {description}
          </p>
        )}

        {/* Timeline container */}
        <div className="relative px-2 sm:px-4">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)] -translate-x-1/2" />

          {/* Entries */}
          <div className="flex flex-col gap-36">
            {entries.map((entry, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={entry.id}
                  className="relative flex items-center justify-between min-h-[210px]"
                >
                  {/* LEFT SIDE */}
                  <div
                    className={`w-1/2 ${
                      isLeft ? "pr-20 sm:pr-24 md:pr-32 text-right" : "invisible"
                    }`}
                  >
                    <div className="max-w-[260px] ml-auto">
                      <h3 className="text-2xl font-bold leading-snug text-[var(--color7)]">
                        {entry.period}
                      </h3>

                      <h4 className="mt-8 text-xl font-bold leading-tight text-[var(--color7)]">
                        {entry.title}
                      </h4>

                      <p className="mt-8 text-sm leading-6 text-[var(--color7)]">
                        {entry.summary}
                      </p>
                    </div>
                  </div>

                  {/* CENTER ICON */}
                  <div className="mt-2 w-24 h-24 shrink-0 rounded-full border-4 border-[var(--color7)] bg-[var(--bg)] flex items-center justify-center overflow-hidden p-4 shadow-[var(--shadow)]">
                    <img
                      src={entry.images[0].src}
                      alt={entry.images[0].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* RIGHT SIDE */}
                  <div
                    className={`w-1/2 ${
                      !isLeft ? "pl-20 sm:pl-24 md:pl-32 text-left" : "invisible"
                    }`}
                  >
                    <div className="max-w-[260px]">
                      <h3 className="text-2xl font-bold leading-snug text-[var(--color7)]">
                        {entry.period}
                      </h3>

                      <h4 className="mt-8 text-xl font-bold leading-tight text-[var(--color7)]">
                        {entry.title}
                      </h4>

                      <p className="mt-8 text-sm leading-6 text-[var(--color7)]">
                        {entry.summary}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
