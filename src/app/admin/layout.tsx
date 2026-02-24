"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthed(false);
      return;
    }

    fetch("/api/admin/auth", { method: "GET" }).then((res) => {
      if (!res.ok) {
        router.replace("/admin/login");
      } else {
        setAuthed(true);
      }
    });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (authed === null) return <div className={styles.layout} />;

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  return (
    <div className={styles.layout}>
      <header className={styles.topBar}>
        <h1 className={styles.topBarTitle}>ONA Admin</h1>
        <div className={styles.topBarActions}>
          <a href="/admin/news" className={styles.topBarLink}>
            News
          </a>
          <a href="/" className={styles.topBarLink} target="_blank">
            View Site
          </a>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
