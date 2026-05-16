// import TimelineSection from "./components/TimelineSection";
// import PinballCanvas from "./game/PinballCanvas";

function Navbar() {
  const navItems = [
    { label: "Game", href: "#game", active: true },
    { label: "Timeline", href: "#timeline" },
    { label: "Resume", href: "/resume.pdf" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-4 text-[var(--text)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex min-h-[40px] w-full max-w-[1400px] min-w-0 items-center justify-between gap-4">
        
        {/* Logo / Name */}
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-medium uppercase tracking-[0.28em] text-[var(--border)] sm:text-base">
            Parth Shukla
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition ${
                item.active
                  ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                  : "border-transparent text-[var(--text)]/70 hover:border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Navbar;