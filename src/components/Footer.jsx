import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--bg)] text-[var(--text)] py-6 mt-12 flex flex-col items-center border-t border-[var(--border)]">
        <br/><br/>
      
      {/* Social Links */}
      <div className="flex flex-row gap-12 mb-3">
        
        <a
          href="https://github.com/ParthS28"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-1 text-sm uppercase tracking-wider transition-colors text-[var(--text)] hover:text-[var(--accent)]"
        >
          <FaGithub className="text-lg" />
          
        </a>

        <a
          href="https://linkedin.com/in/parthsh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-1 text-sm uppercase tracking-wider transition-colors text-[var(--text)] hover:text-[var(--accent)]"
        >
          <FaLinkedin className="text-lg" />
          
        </a>

        <a
          href="mailto:parthshukla285@gmail.com"
          className="flex items-center justify-center p-1 text-sm uppercase tracking-wider transition-colors text-[var(--text)] hover:text-[var(--accent)]"
        >
          <FaEnvelope className="text-lg" />
          
        </a>
      </div>

      {/* Divider line (subtle polish) */}
      <div className="w-24 h-[1px] bg-[var(--border)] opacity-60 mb-3" />

      {/* Copyright */}
      <div className="text-xs text-[var(--text)]/70">
        &copy; {new Date().getFullYear()} Parth Shukla. All rights reserved.
      </div>
    </footer>
  );
}
