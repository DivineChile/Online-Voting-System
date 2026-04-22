import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Vote,
  BarChart2,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard },
  { label: "Vote", to: "/student/vote", icon: Vote },
  { label: "Results", to: "/student/results", icon: BarChart2 },
];

function Sidebar({ student, onNavigate }) {
  const initials = (student?.name || "Student")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-[250px] bg-[#26215C] flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <div className="w-8 h-8 bg-[#534AB7] rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={15} color="#EEEDFE" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#EEEDFE] leading-tight">
            CampusVoice
          </p>
          <p className="text-[10px] text-white/35">Student portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <p className="text-[10px] tracking-[.08em] text-white/25 px-2 mb-1.5 uppercase">
          Navigation
        </p>

        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/student"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] transition-colors duration-150 w-full ${
                      isActive
                        ? "bg-white/[.12] text-white"
                        : "text-white/55 hover:bg-white/[.07] hover:text-white/85"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={14} strokeWidth={1.5} />
                      <span className="flex-1">{item.label}</span>
                      {isActive ? (
                        <span className="w-1 h-1 rounded-full bg-[#AFA9EC]" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-[10px] font-medium text-[#EEEDFE] flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#EEEDFE] truncate">
            {student?.name || "Student"}
          </p>
          <p className="text-[10px] text-white/35 truncate">
            {student?.email || "student@poly.edu.ng"}
          </p>
        </div>
      </div>
    </aside>
  );
}

function getPageMeta(pathname) {
  if (pathname === "/student") {
    return {
      title: "Student dashboard",
      subtitle: "Overview of your voting portal",
    };
  }

  if (pathname === "/student/vote") {
    return {
      title: "Vote",
      subtitle: "Cast your ballot for the active election",
    };
  }

  if (pathname === "/student/results") {
    return {
      title: "Results",
      subtitle: "View published election results",
    };
  }

  return {
    title: "Student portal",
    subtitle: new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

function TopBar({ pageTitle, pageSubtitle, onLogout, onOpenMenu }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 md:px-7 py-3 flex items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
          aria-label="Open student menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <p className="text-[14px] font-medium text-gray-900 truncate">
            {pageTitle}
          </p>
          {pageSubtitle ? (
            <p className="text-[11px] text-gray-400 truncate">{pageSubtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#3B6D11] bg-[#EAF3DE] px-2.5 py-1 rounded-full border border-[#C0DD97] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#639922] animate-pulse" />
          Portal active
        </span>

        <button
          onClick={onLogout}
          className="rounded-lg border border-gray-200 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [sidebarAnimatingIn, setSidebarAnimatingIn] = useState(false);

  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  useEffect(() => {
    let enterTimer;
    let exitTimer;

    if (sidebarOpen) {
      setSidebarMounted(true);
      document.body.style.overflow = "hidden";

      enterTimer = setTimeout(() => {
        setSidebarAnimatingIn(true);
      }, 10);
    } else {
      setSidebarAnimatingIn(false);
      document.body.style.overflow = "";

      exitTimer = setTimeout(() => {
        setSidebarMounted(false);
      }, 300);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const student = {
    name: profile?.full_name || "Student",
    email: profile?.email || "student@poly.edu.ng",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        <Sidebar student={student} />
      </div>

      {sidebarMounted ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${
              sidebarAnimatingIn ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeSidebar}
            aria-label="Close student menu overlay"
          />

          <div
            className={`relative z-50 h-full w-[250px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              sidebarAnimatingIn ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar student={student} onNavigate={closeSidebar} />
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            className={`absolute top-4 right-4 z-50 rounded-lg bg-white p-2 text-slate-700 shadow transition-all duration-300 ${
              sidebarAnimatingIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
            aria-label="Close student menu"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          pageTitle={pageMeta.title}
          pageSubtitle={pageMeta.subtitle}
          onLogout={handleLogout}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-7 py-4 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}