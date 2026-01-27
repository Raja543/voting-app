"use client";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  if (pathname === "/login" || pathname === "/signup") return null;

  const displayName =
    session?.user?.name || session?.user?.email || "Creator";

  const isAdmin = Boolean(session?.user?.isAdmin);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"submission" | "voting" | null>(null);

  useEffect(() => {
    if (pathname === "/submitted-posts" || pathname === "/submit-content") {
      setOpenMenu("submission");
    } else if (pathname === "/results" || pathname === "/") {
      setOpenMenu("voting");
    } else {
      setOpenMenu(null);
    }
  }, [pathname]);

  useEffect(() => {
    let startX = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches[0].clientX - startX < -80) {
        setSidebarOpen(false);
      }
    };

    const el = sidebarRef.current;
    if (!el) return;

    el.addEventListener("touchstart", onStart);
    el.addEventListener("touchmove", onMove);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white rounded px-2 py-1"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-950 border-r border-gray-800
        z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex flex-col items-center text-center space-y-1">
          <Image src="/logo.png" alt="Giga Creator Hub" width={36} height={36} />
          <h1 className="text-lg tracking-widest uppercase text-white">
            GIGA CREATOR HUB
          </h1>
          {status === "authenticated" && (
            <p className="text-xs text-white/70">Hello {displayName}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="px-4 py-4 space-y-6 text-lg">
          <Section title="Info">
            <NavLink href="/announcements" label="Announcement" icon="announcement" />
            <NavLink href="/assets" label="Assets" icon="assets" />
            <NavLink href="/townhall" label="Townhall" icon="townhall" />
          </Section>

          <Section title="Content">
            <ParentLink
              href="/submit-content"
              label="Submission"
              icon="submission"
              childPaths={["/submitted-posts"]}
              open={openMenu === "submission"}
              onToggle={() =>
                setOpenMenu(openMenu === "submission" ? null : "submission")
              }
            />

            <DropdownContent open={openMenu === "submission"}>
              <SubNavLink href="/submitted-posts" label="Submitted posts" />
            </DropdownContent>

            <ParentLink
              href="/"
              label="Voting"
              icon="voting"
              childPaths={["/results"]}
              open={openMenu === "voting"}
              onToggle={() =>
                setOpenMenu(openMenu === "voting" ? null : "voting")
              }
            />

            <DropdownContent open={openMenu === "voting"}>
              <SubNavLink href="/results" label="Results" />
            </DropdownContent>
          </Section>

          <Section title="Account">
            <NavLink href="/profile" label="Profile" icon="profile" />

            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded
                text-[#E40041] hover:bg-gray-800 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center gap-3 px-3 py-2 rounded
                text-[#10B981] hover:bg-gray-800 transition"
              >
                Login
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`block px-3 py-2 rounded font-medium transition ${pathname === "/admin"
                    ? "bg-[#10B981] text-white"
                    : "text-[#10B981] hover:bg-gray-800"
                  }`}
              >
                Admin
              </Link>
            )}
          </Section>
        </nav>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-500 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded transition ${active
          ? "bg-white text-black"
          : "text-white hover:bg-gray-800"
        }`}
    >
      {icon && (
        <Image
          src={active ? `/${icon}dark.png` : `/${icon}.png`}
          alt={label}
          width={16}
          height={16}
        />
      )}
      {label}
    </Link>
  );
}

function ParentLink({
  href,
  label,
  icon,
  childPaths,
  open,
  onToggle,
}: {
  href: string;
  label: string;
  icon: string;
  childPaths: string[];
  open: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const parentActive = pathname === href;
  const childActive = childPaths.includes(pathname);

  return (
    <div className="flex items-center justify-between rounded hover:bg-gray-800 transition-colors">
      <Link
        href={href}
        onClick={onToggle}
        className={`flex items-center gap-3 px-3 py-2 flex-1 rounded transition-colors ${parentActive ? "bg-white text-black" : "text-white"
          }`}
      >
        <Image
          src={parentActive ? `/${icon}dark.png` : `/${icon}.png`}
          alt={label}
          width={16}
          height={16}
        />
        {label}
      </Link>
      <button
        type="button"
        onClick={onToggle}
        className="px-2 py-2 flex items-center justify-center"
        aria-label={open ? "Collapse" : "Expand"}
      >
        <Image
          src={open ? "/downclick.png" : "/rightclick.png"}
          alt="toggle"
          width={12}
          height={12}
          className="transition-transform duration-200"
        />
      </button>
    </div>
  );
}

function DropdownContent({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`ml-6 overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
    >
      <div className="pt-1 space-y-1">{children}</div>
    </div>
  );
}

function SubNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-3 py-1 rounded text-sm transition ${active
          ? "bg-white text-black"
          : "text-white/70 hover:text-white hover:bg-gray-800"
        }`}
    >
      {label}
    </Link>
  );
}
