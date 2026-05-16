import React from "react";
import timelineData from "../data/timeline.json";

export default function Timeline() {
  const { title, description, entries } = timelineData;

  return (
    <section className="bg-[var(--bg)] text-[var(--text)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h2 className="text-center text-4xl font-bold mb-2 text-[var(--text-h)]">
          {title}
        </h2>

        {description && (
          <p className="text-center mb-12 text-[var(--text)]">
            {description}
          </p>
        )}

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[var(--border)] -translate-x-1/2" />

          {/* Entries */}
          <div className="flex flex-col gap-16">
            {entries.map((entry, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={entry.id}
                  className="relative flex items-center justify-between min-h-[140px]"
                >
                  {/* LEFT SIDE */}
                  <div
                    className={`w-1/2 ${
                      isLeft ? "pr-16 text-right" : "invisible"
                    }`}
                  >
                    <p className="text-sm mb-2 text-[var(--text)]">
                      {entry.title}
                    </p>

                    <h3 className="text-lg font-semibold text-[var(--text-h)]">
                      {entry.period}
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text)]">
                      {entry.summary}
                    </p>
                  </div>

                  {/* CENTER ICON */}
                  <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] bg-[var(--bg)] flex items-center justify-center overflow-hidden p-3 shadow-[var(--shadow)]">
                    <img
                      src={entry.images[0].src}
                      alt={entry.images[0].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* RIGHT SIDE */}
                  <div
                    className={`w-1/2 ${
                      !isLeft ? "pl-16 text-left" : "invisible"
                    }`}
                  >
                    <p className="text-sm mb-2 text-[var(--text)]">
                      {entry.title}
                    </p>

                    <h3 className="text-lg font-semibold text-[var(--text-h)]">
                      {entry.period}
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text)]">
                      {entry.summary}
                    </p>
                  </div>
                  <br/> <br/>
                </div>
                
              );
            })}
            
          </div>
          
        </div>
      </div>
    </section>
  );
}