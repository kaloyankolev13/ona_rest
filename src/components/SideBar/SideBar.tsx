"use client";

import { useState } from "react";
import styles from "./SideBar.module.css";

interface SideBarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export function SideBar({ onMenuToggle }: SideBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onMenuToggle?.(newState);
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className={styles.line}></span>
        <span className={styles.line}></span>
        <span className={styles.line}></span>
      </button>

      {/* Space for future sideways text */}
      <div className={styles.sideContent}></div>
    </div>
  );
}
