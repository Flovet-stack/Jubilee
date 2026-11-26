"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

import { JubileeIcon } from "@/components/brand/jubilee-icon";
import { JubileeLogo } from "@/components/brand/jubilee-logo";
import {
  HugeiconsArrowRightIcon,
  HugeiconsBellIcon,
  HugeiconsBriefcaseBusinessIcon,
  HugeiconsCircleCheckIcon,
  HugeiconsCircleQuestionMarkIcon,
  HugeiconsFileTextIcon,
  HugeiconsHomeIcon,
  HugeiconsMenuIcon,
  HugeiconsPlusIcon,
  HugeiconsSearchIcon,
  HugeiconsSettingsIcon,
  HugeiconsUserIcon,
  HugeiconsXIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/feedback";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  locales,
  localeTag,
  type Locale,
} from "@/i18n/locales";
import { site } from "@/lib/site";
import { isDarkNow, saveTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

import {
  activeNav,
  COLLAPSE_COOKIE,
  COLLAPSE_COOKIE_MAX_AGE,
  NAV_ITEMS,
  type NavKey,
  pathInLocale,
  pathWithoutLocale,
  cvRowText,
  type CvRowText,
  sidebarCvs,
} from "../logic";
import {
  CheckGlyph,
  ChevronLeftGlyph,
  ChevronRightGlyph,
  LanguageIcon,
  LogOutIcon,
  MoonIcon,
  UnfoldIcon,
} from "./menu-icons";
import { SidebarPanelIcon } from "./sidebar-panel-icon";

export type ShellLabels = {
  appName: string;
  home: string;
  sidebar: string;
  menu: string;
  closeMenu: string;
  collapse: string;
  expand: string;
  notifications: string;
  nothingNew: string;
  nav: Record<NavKey, string>;
  help: string;
  account: string;
  settings: string;
  signOut: string;
  plan: string;
  darkMode: string;
  language: string;
  back: string;
  localeNames: Record<Locale, string>;
  cvs: {
    title: string;
    short: string;
    create: string;
    reassure: string;
    error: string;
    retry: string;
    untitled: string;
    /** "View all resumes ({count})"; `{count}` is replaced. */
    viewAll: string;
  };
};

export type ShellCv = {
  id: string;
  title: string;
  /** From the CV's basics; "" when not filled in yet. */
  headline: string;
  name: string;
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

type ShellState = {
  locale: Locale;
  labels: ShellLabels;
  /** True only in the desktop rail; the phone sheet is always expanded. */
  collapsed: boolean;
  /** The server action that signs out, passed in from the server. */
  signOut: (formData: FormData) => Promise<void>;
};

const ShellContext = createContext<ShellState | null>(null);

function useShell(): ShellState {
  const value = useContext(ShellContext);
  if (!value) throw new Error("Shell parts must render inside <ShellFrame>.");
  return value;
}

function saveCollapsed(collapsed: boolean) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${COLLAPSE_COOKIE}=${collapsed ? "1" : "0"}; path=/; max-age=${COLLAPSE_COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

/** Saves the choice; only an explicit pick does this (0017). */
function rememberLocale(locale: Locale) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

const ICONS: Record<NavKey, ReactNode> = {
  home: <HugeiconsHomeIcon />,
  jobs: <HugeiconsSearchIcon />,
  applications: <HugeiconsBriefcaseBusinessIcon />,
  toApprove: <HugeiconsCircleCheckIcon />,
};

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

type ShellFrameProps = {
  locale: Locale;
  labels: ShellLabels;
  /** From the cookie, read on the server so a reload doesn't flash. */
  initialCollapsed: boolean;
  /** First name, or null when the profile has none. */
  name: string | null;
  /** The saved-CV list (a server slot, streamed in its own Suspense). */
  cvList: ReactNode;
  /** Waiting items in To approve; hidden at 0 and until the queue exists. */
  toApproveCount?: number;
  signOut: (formData: FormData) => Promise<void>;
  children: ReactNode;
};

/**
 * The app shell (decision 0027, spec 15). At 1024 px and wider: a grey desk
 * with the sidebar on it and one white window that scrolls inside itself.
 * Below that: a top bar, full-bleed content and the sidebar in a left sheet.
 */
export function ShellFrame({
  locale,
  labels,
  initialCollapsed,
  name,
  cvList,
  toApproveCount,
  signOut,
  children,
}: ShellFrameProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  // The keyboard shortcut switches instantly; the button animates (Emil).
  const [instant, setInstant] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSheetOpen(false);
  }

  const toggle = (fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    setCollapsed((was) => {
      saveCollapsed(!was);
      return !was;
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "b") return;
      event.preventDefault();
      setInstant(true);
      setCollapsed((was) => {
        saveCollapsed(!was);
        return !was;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebar = (
    <SidebarContents
      name={name}
      cvList={cvList}
      toApproveCount={toApproveCount}
      onToggle={() => toggle(false)}
    />
  );

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col bg-desk lg:h-dvh lg:min-h-0 lg:flex-row lg:gap-2 lg:overflow-hidden lg:p-2">
        {/* Desktop sidebar */}
        <ShellContext.Provider value={{ locale, labels, collapsed, signOut }}>
          <aside
            aria-label={labels.sidebar}
            data-collapsed={collapsed || undefined}
            className={cn(
              "hidden shrink-0 overflow-x-hidden overflow-y-auto overscroll-contain lg:flex",
              collapsed ? "w-14" : "w-62",
              instant
                ? "transition-none"
                : "transition-[width] duration-(--dur-base) ease-enter motion-reduce:transition-none",
            )}
          >
            {sidebar}
          </aside>
        </ShellContext.Provider>

        {/* Phone and tablet top bar */}
        <ShellContext.Provider
          value={{ locale, labels, collapsed: false, signOut }}
        >
          <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-line bg-desk px-2 lg:hidden">
            <DialogPrimitive.Root open={sheetOpen} onOpenChange={setSheetOpen}>
              <DialogPrimitive.Trigger
                render={
                  <IconButton
                    label={labels.menu}
                    tooltip={false}
                    icon={<HugeiconsMenuIcon />}
                  />
                }
              />
              <DialogPrimitive.Portal>
                <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-[color-mix(in_oklab,var(--ink)_40%,transparent)] transition-opacity duration-(--dur-base) ease-enter data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-starting-style:opacity-0" />
                <DialogPrimitive.Popup
                  aria-label={labels.sidebar}
                  className={cn(
                    "fixed inset-y-0 start-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col overflow-y-auto overscroll-contain bg-desk pb-[env(safe-area-inset-bottom)] shadow-float outline-none",
                    "transition-[translate,opacity] duration-250 ease-enter",
                    "data-ending-style:-translate-x-full data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit data-starting-style:-translate-x-full",
                    "motion-reduce:data-ending-style:translate-x-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-starting-style:opacity-0",
                  )}
                >
                  <DialogPrimitive.Title className="sr-only">
                    {labels.menu}
                  </DialogPrimitive.Title>
                  <div className="absolute end-2 top-2">
                    <DialogPrimitive.Close
                      render={
                        <IconButton
                          label={labels.closeMenu}
                          tooltip={false}
                          icon={<HugeiconsXIcon />}
                        />
                      }
                    />
                  </div>
                  <SidebarContents
                    name={name}
                    cvList={cvList}
                    toApproveCount={toApproveCount}
                    inSheet
                  />
                </DialogPrimitive.Popup>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
            <p className="min-w-0 flex-1 truncate px-1 text-base font-semibold text-ink">
              {pageTitle(pathname, labels)}
            </p>
            <Notifications />
          </header>
        </ShellContext.Provider>

        {/* The content window */}
        <div
          id="content"
          className="flex min-w-0 flex-1 flex-col bg-card lg:overflow-y-auto lg:overscroll-contain lg:rounded-box lg:border lg:border-line"
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}

/** The phone top bar's title: the section the page belongs to. */
function pageTitle(pathname: string, labels: ShellLabels): string {
  const active = activeNav(pathname);
  if (active) return labels.nav[active];
  const path = pathWithoutLocale(pathname);
  if (path.startsWith("/settings")) return labels.settings;
  if (path.startsWith("/cvs")) return labels.cvs.short;
  return labels.appName;
}

/* ------------------------------------------------------------------ */
/* Sidebar contents (rendered in the rail and in the phone sheet)      */
/* ------------------------------------------------------------------ */

function SidebarContents({
  name,
  cvList,
  toApproveCount,
  onToggle,
  inSheet = false,
}: {
  name: string | null;
  cvList: ReactNode;
  toApproveCount?: number;
  onToggle?: () => void;
  inSheet?: boolean;
}) {
  const { locale, labels, collapsed } = useShell();

  return (
    <div
      className={cn(
        "flex min-h-full w-full flex-col gap-6 py-2",
        collapsed ? "px-1" : "px-2",
      )}
    >
      {/* Top row: logo, notifications, collapse */}
      <div
        className={cn(
          "flex items-center gap-1",
          collapsed ? "flex-col" : "pe-0",
          inSheet && "pe-12",
        )}
      >
        {collapsed && onToggle ? (
          // Collapsed rail: the mark is the expand button (0035).
          <Tooltip content={labels.expand} side="right">
            <button
              type="button"
              aria-label={labels.expand}
              aria-expanded={false}
              onClick={onToggle}
              className="flex size-11 items-center justify-center rounded-control text-ink outline-none focus-visible:shadow-[0_0_0_2px_var(--violet)] hover-fine:bg-wash-hover"
            >
              <JubileeIcon height={20} />
            </button>
          </Tooltip>
        ) : (
          <Link
            href={`/${locale}/home`}
            aria-label={labels.home}
            className={cn(
              "flex min-h-11 min-w-0 flex-1 items-center rounded-control px-2 text-ink outline-none focus-visible:shadow-[0_0_0_2px_var(--violet)]",
              collapsed && "flex-none justify-center px-0",
            )}
          >
            {/* The real logo files (0010, 0019), sized to the rows (0035). */}
            {collapsed ? (
              <JubileeIcon height={20} />
            ) : (
              <JubileeLogo height={18} />
            )}
          </Link>
        )}
        {inSheet || collapsed ? null : <Notifications />}
        {onToggle && !collapsed ? (
          <IconButton
            label={labels.collapse}
            aria-expanded
            icon={<SidebarPanelIcon />}
            onClick={onToggle}
            className="text-ink-muted [&_svg]:stroke-[1.75]"
          />
        ) : null}
      </div>

      {/* Main links */}
      <nav aria-label={labels.sidebar}>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <NavLink
                navKey={item.key}
                href={`/${locale}${item.path}`}
                count={item.key === "toApprove" ? toApproveCount : undefined}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Saved CVs */}
      {cvList}

      {/* Bottom: Help, then the account */}
      <div className="mt-auto flex flex-col gap-0.5 pt-2">
        <RowLink
          href={`mailto:${SUPPORT_EMAIL}`}
          icon={<HugeiconsCircleQuestionMarkIcon />}
          label={labels.help}
        />
        <AccountMenu name={name} />
      </div>
    </div>
  );
}

// Same address as the sign-in footer.
const SUPPORT_EMAIL = site.supportEmail;

/**
 * A row's text. It stays mounted when the rail collapses and fades out with
 * the width (0027), so the change reads as one motion, not a pop. Under
 * reduced motion the width snaps and only this fade remains.
 */
function RowLabel({
  collapsed,
  className,
  title,
  children,
}: {
  collapsed: boolean;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden={collapsed || undefined}
      title={title}
      className={cn(
        "min-w-0 truncate transition-opacity duration-(--dur-base) ease-enter",
        collapsed ? "pointer-events-none absolute opacity-0" : "opacity-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Row styles shared by links, CV rows and the account button. */
const rowClasses = (active: boolean, collapsed: boolean) =>
  cn(
    // Type spacing (0029): 16 px text sets a 40 px row; touch keeps 44.
    // Grey (ink-muted, 8:1 on the desk) for every row; the current page in
    // ink on a wash. Medium weight, and icons at 1.75 px to match it.
    "jb-type flex w-full min-w-0 items-center rounded-control text-start text-base font-medium text-ink-muted outline-none select-none",
    "[&_svg]:stroke-[1.75]",
    "pointer-coarse:min-h-11",
    "transition-colors duration-(--dur-fast) hover-fine:bg-wash-hover",
    "focus-visible:shadow-[0_0_0_2px_var(--violet)]",
    active && "bg-wash-hover font-semibold text-ink",
    collapsed && "jb-type-square relative size-11 min-h-11 justify-center",
  );

function NavLink({
  navKey,
  href,
  count,
}: {
  navKey: NavKey;
  href: string;
  count?: number;
}) {
  const { labels, collapsed } = useShell();
  const active = activeNav(usePathname()) === navKey;
  const label = labels.nav[navKey];
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={rowClasses(active, collapsed)}
    >
      <span className="jb-type-icon">{ICONS[navKey]}</span>
      <RowLabel collapsed={collapsed} className="flex-1">
        {label}
      </RowLabel>
      {count && !collapsed ? <Badge tone="neutral">{count}</Badge> : null}
    </Link>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

function RowLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const { collapsed } = useShell();
  const link = (
    <a
      href={href}
      aria-label={collapsed ? label : undefined}
      className={rowClasses(false, collapsed)}
    >
      <span className="jb-type-icon">{icon}</span>
      <RowLabel collapsed={collapsed}>{label}</RowLabel>
    </a>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

/* ------------------------------------------------------------------ */
/* Notifications (empty until features send events)                   */
/* ------------------------------------------------------------------ */

function Notifications() {
  const { labels, collapsed } = useShell();
  const trigger = (
    <Popover.Trigger
      render={
        <IconButton
          label={labels.notifications}
          tooltip={false}
          icon={<HugeiconsBellIcon />}
          className="text-ink-muted [&_svg]:stroke-[1.75]"
        />
      }
    />
  );
  return (
    <Popover.Root>
      {collapsed ? (
        <Tooltip content={labels.notifications} side="right">
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}
      <Popover.Portal>
        <Popover.Positioner
          side={collapsed ? "right" : "bottom"}
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <Popover.Popup
            className={cn(
              "w-[min(20rem,var(--available-width))] rounded-card bg-card p-4 text-ink outline-none",
              "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            )}
          >
            <Popover.Title className="text-base font-semibold">
              {labels.notifications}
            </Popover.Title>
            <p className="mt-1 text-sm text-ink-muted">{labels.nothingNew}</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Account menu                                                        */
/* ------------------------------------------------------------------ */

function AccountMenu({ name }: { name: string | null }) {
  const { locale, labels, collapsed, signOut } = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"main" | "language">("main");
  const popupRef = useRef<HTMLDivElement>(null);
  const focusAfterSwap = useRef<"back" | "language" | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  // Measure the current panel so the popup can animate between heights.
  // A callback ref: the content mounts with the portal, after `open` flips.
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const shown = name ?? labels.account;

  // After the panels swap (0035), focus the back row, or Language when
  // coming back, so keyboard and screen reader users follow the change.
  useEffect(() => {
    const target = focusAfterSwap.current;
    if (!target || !popupRef.current) return;
    focusAfterSwap.current = null;
    popupRef.current
      .querySelector<HTMLElement>(`[data-menu-focus="${target}"]`)
      ?.focus();
  }, [panel]);

  const goTo = (next: "main" | "language") => {
    focusAfterSwap.current = next === "language" ? "back" : "language";
    setPanel(next);
  };

  // Up and Down move between the rows, like a menu.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const rows = Array.from(
      popupRef.current?.querySelectorAll<HTMLElement>("[data-menu-row]") ?? [],
    );
    if (rows.length === 0) return;
    event.preventDefault();
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    rows[(at + step + rows.length) % rows.length]?.focus();
  };

  const backOnLeft = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo("main");
    }
  };

  const trigger = (
    <button
      type="button"
      aria-label={collapsed ? shown : undefined}
      className={rowClasses(false, collapsed)}
    >
      {/* Same box, radius and spacing as the other rows: the avatar takes
          the icon slot (1lh), so the row is the same height. */}
      <span aria-hidden="true" className="jb-type-icon">
        {name ? (
          <Avatar name={name} size="sm" className="size-full text-xs" />
        ) : (
          <HugeiconsUserIcon />
        )}
      </span>
      <RowLabel collapsed={collapsed} className="flex-1" title={shown}>
        {shown}
      </RowLabel>
      {collapsed ? null : (
        <span aria-hidden="true" className="jb-type-icon text-ink-subtle">
          <UnfoldIcon />
        </span>
      )}
    </button>
  );

  // Flush rows (0035): edge to edge, padding from the type (0029), 44 px.
  const row =
    "jb-type flex min-h-11 w-full cursor-pointer items-center text-start text-base text-ink outline-none select-none hover-fine:bg-wash-hover focus-visible:shadow-[inset_0_0_0_2px_var(--violet)] [&_svg]:stroke-[1.75]";

  const pick = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    rememberLocale(next);
    router.push(pathInLocale(pathname, next));
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next, details) => {
        // Escape in the language panel goes back first (0035).
        if (!next && details.reason === "escape-key" && panel === "language") {
          details.cancel();
          goTo("main");
          return;
        }
        // Swapping panels removes the row that was pressed, so the press
        // looks like it landed outside: it didn't, keep the menu open.
        const target = details.event?.target;
        if (
          !next &&
          details.reason === "outside-press" &&
          target instanceof Node &&
          !target.isConnected
        ) {
          details.cancel();
          return;
        }
        setOpen(next);
        if (next) {
          setDark(isDarkNow());
          setPanel("main");
        }
      }}
    >
      {collapsed ? (
        <Tooltip content={shown} side="right">
          <Popover.Trigger render={trigger} />
        </Tooltip>
      ) : (
        <Popover.Trigger render={trigger} />
      )}
      <Popover.Portal>
        <Popover.Positioner
          side={collapsed ? "right" : "top"}
          align={collapsed ? "end" : "start"}
          sideOffset={8}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <Popover.Popup
            ref={popupRef}
            aria-label={labels.account}
            onKeyDown={onKeyDown}
            className={cn(
              // As wide as the sidebar's content (w-62 minus its gutters).
              "flex w-[min(14.5rem,var(--available-width))] flex-col overflow-hidden rounded-card border border-line bg-menu text-ink shadow-menu outline-none",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            )}
          >
            {/* The popup's height follows the panel (0035). */}
            <div
              className="overflow-hidden duration-(--dur-base) ease-enter motion-safe:transition-[height]"
              style={height == null ? undefined : { height }}
            >
              <div ref={contentRef}>
                {panel === "main" ? (
                  <div
                    key="main"
                    data-panel="main"
                    className="jb-menu-panel flex flex-col"
                  >
                    {/* Who: photo, name, plan. No email: they know it. */}
                    <div className="jb-type flex items-center gap-3">
                      {name ? (
                        <Avatar
                          name={name}
                          size="md"
                          className="shrink-0 rounded-control"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-tint text-violet">
                          <span className="size-5">
                            <HugeiconsUserIcon />
                          </span>
                        </span>
                      )}
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <Popover.Title
                          className="max-w-full truncate text-base font-semibold"
                          title={shown}
                        >
                          {shown}
                        </Popover.Title>
                        <Badge tone="violet">{labels.plan}</Badge>
                      </div>
                    </div>
                    <Divider />

                    <Switch
                      size="sm"
                      data-menu-row
                      label={
                        <span className="flex items-center gap-(--px)">
                          <span className="jb-type-icon text-ink-muted [&_svg]:stroke-[1.75]">
                            <MoonIcon />
                          </span>
                          {labels.darkMode}
                        </span>
                      }
                      checked={dark}
                      onCheckedChange={(next) => {
                        setDark(next);
                        saveTheme(next ? "dark" : "light");
                      }}
                      className="jb-type py-0 hover-fine:bg-wash-hover"
                    />
                    <Divider />

                    <Link
                      href={`/${locale}/settings`}
                      data-menu-row
                      className={row}
                      onClick={() => setOpen(false)}
                    >
                      <span className="jb-type-icon text-ink-muted">
                        <HugeiconsSettingsIcon />
                      </span>
                      {labels.settings}
                    </Link>
                    <button
                      type="button"
                      data-menu-row
                      data-menu-focus="language"
                      aria-haspopup="true"
                      className={row}
                      onClick={() => goTo("language")}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight") {
                          event.preventDefault();
                          goTo("language");
                        }
                      }}
                    >
                      <span className="jb-type-icon text-ink-muted">
                        <LanguageIcon />
                      </span>
                      <span className="flex-1">{labels.language}</span>
                      <span className="max-w-24 truncate text-sm text-ink-muted">
                        {labels.localeNames[locale]}
                      </span>
                      <span
                        aria-hidden="true"
                        className="jb-type-icon text-ink-subtle"
                      >
                        <ChevronRightGlyph />
                      </span>
                    </button>
                    <Divider />

                    <button
                      type="button"
                      data-menu-row
                      disabled={pending}
                      className={cn(
                        row,
                        "text-danger hover-fine:bg-wash-danger",
                      )}
                      onClick={() =>
                        startTransition(async () => {
                          const data = new FormData();
                          data.set("locale", locale);
                          await signOut(data);
                        })
                      }
                    >
                      <span className="jb-type-icon">
                        <LogOutIcon />
                      </span>
                      {labels.signOut}
                    </button>
                  </div>
                ) : (
                  <div
                    key="language"
                    data-panel="language"
                    className="jb-menu-panel flex flex-col"
                    role="group"
                    aria-label={labels.language}
                  >
                    <button
                      type="button"
                      data-menu-row
                      data-menu-focus="back"
                      aria-label={`${labels.back}: ${labels.language}`}
                      className={cn(row, "font-semibold")}
                      onClick={() => goTo("main")}
                      onKeyDown={backOnLeft}
                    >
                      <span
                        aria-hidden="true"
                        className="jb-type-icon text-ink-muted"
                      >
                        <ChevronLeftGlyph />
                      </span>
                      {labels.language}
                    </button>
                    <Divider />
                    {locales.map((l) => {
                      const on = l === locale;
                      return (
                        <button
                          key={l}
                          type="button"
                          data-menu-row
                          lang={localeTag(l)}
                          aria-current={on ? "true" : undefined}
                          className={row}
                          onClick={() => pick(l)}
                          onKeyDown={backOnLeft}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {labels.localeNames[l]}
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "jb-type-icon text-violet",
                              !on && "invisible",
                            )}
                          >
                            <CheckGlyph />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Divider() {
  return <hr className="border-line" />;
}

/* ------------------------------------------------------------------ */
/* Saved CVs                                                           */
/* ------------------------------------------------------------------ */

type CvSectionProps =
  { state: "ok"; cvs: ShellCv[] } | { state: "error" } | { state: "loading" };

/**
 * "Saved resumes" / "Saved CVs" (0027). Rows open the editor; with no CVs,
 * one primary button starts the first, with a line of reassurance.
 */
export function CvSection(props: CvSectionProps) {
  const { locale, labels, collapsed } = useShell();
  const pathname = usePathname();
  const headingId = useId();
  const newHref = `/${locale}/cvs/new`;
  const add = (
    <IconButton
      label={labels.cvs.create}
      icon={<HugeiconsPlusIcon />}
      size="sm"
      tooltip={collapsed}
      className="text-ink-muted [&_svg]:stroke-[1.75]"
      render={<Link href={newHref} />}
      nativeButton={false}
    />
  );

  const list = () => {
    if (props.state === "loading") {
      return (
        <div className="flex flex-col gap-2 px-2.5 py-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-5 w-full animate-pulse rounded-mark bg-wash-hover motion-reduce:animate-none"
            />
          ))}
        </div>
      );
    }
    if (props.state === "error") {
      return (
        <p className="px-2.5 text-sm text-ink-muted">
          {labels.cvs.error}{" "}
          <a href={pathname} className="font-semibold text-violet underline">
            {labels.cvs.retry}
          </a>
        </p>
      );
    }
    if (props.cvs.length === 0) {
      return (
        <div className="flex flex-col gap-2 px-1">
          <ButtonLink
            href={newHref}
            variant="primary"
            fullWidth
            icon={<HugeiconsPlusIcon />}
          >
            {labels.cvs.create}
          </ButtonLink>
          <p className="px-1.5 text-sm text-ink-muted">{labels.cvs.reassure}</p>
        </div>
      );
    }
    return <CvList cvs={props.cvs} />;
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Popover.Root>
          <Tooltip content={labels.cvs.short} side="right">
            <Popover.Trigger
              render={
                <IconButton
                  label={labels.cvs.short}
                  tooltip={false}
                  icon={<HugeiconsFileTextIcon />}
                  className="text-ink-muted [&_svg]:stroke-[1.75]"
                />
              }
            />
          </Tooltip>
          <Popover.Portal>
            <Popover.Positioner
              side="right"
              align="start"
              sideOffset={8}
              collisionPadding={16}
              className="z-50 outline-none"
            >
              <Popover.Popup
                className={cn(
                  "flex w-72 flex-col gap-2 rounded-card bg-card p-2 text-ink outline-none",
                  "shadow-[0_0_0_1px_var(--line),var(--shadow-float)]",
                  "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
                  "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
                  "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
                )}
              >
                <Popover.Title className="px-2.5 pt-1 text-sm font-semibold text-ink-muted">
                  {labels.cvs.title}
                </Popover.Title>
                {list()}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        {props.state === "ok" && props.cvs.length > 0 ? add : null}
      </div>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-0 flex-col gap-1"
    >
      <div className="flex items-center justify-between gap-2 ps-2.5">
        <h2 id={headingId} className="text-sm font-semibold text-ink-muted">
          {labels.cvs.title}
        </h2>
        {props.state === "ok" && props.cvs.length > 0 ? add : null}
      </div>
      {list()}
    </section>
  );
}

/**
 * The saved CVs, newest edit first: at most five (0032). With more, a
 * "View all resumes (N)" row links to the Resumes page.
 */
function CvList({ cvs }: { cvs: ShellCv[] }) {
  const { locale, labels } = useShell();
  const pathname = usePathname();
  const { shown, total, viewAll } = sidebarCvs(cvs);
  const allHref = `/${locale}/cvs`;
  const onAll = pathname === allHref;

  return (
    <ul className="flex flex-col gap-0.5">
      {shown.map((cv) => {
        const href = `/${locale}/cvs/${cv.id}`;
        return (
          <li key={cv.id}>
            <CvRow
              href={href}
              current={pathname === href}
              text={cvRowText(cv, labels.cvs.untitled)}
            />
          </li>
        );
      })}
      {viewAll ? (
        <li>
          <Link
            href={allHref}
            aria-current={onAll ? "page" : undefined}
            className={cn(rowClasses(onAll, false), "text-sm")}
          >
            <span className="jb-type-icon">
              <HugeiconsArrowRightIcon />
            </span>
            <span className="flex-1 truncate">
              {labels.cvs.viewAll.replace("{count}", String(total))}
            </span>
          </Link>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * One saved CV: "Headline | Name" in a slightly smaller size than the
 * links, so more of it fits. When it's cut off, hovering with a mouse or
 * focusing with the keyboard scrolls the text once to its end and back
 * (a marquee); reduced motion and touch get the full text in `title`.
 */
function CvRow({
  href,
  current,
  text,
}: {
  href: string;
  current: boolean;
  text: CvRowText;
}) {
  const [play, setPlay] = useState(false);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      aria-label={text.full}
      title={text.full}
      className={cn(rowClasses(current, false), "text-sm")}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setPlay(true);
      }}
      onPointerLeave={() => setPlay(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setPlay(true);
      }}
      onBlur={() => setPlay(false)}
    >
      <span className="jb-type-icon">
        <HugeiconsFileTextIcon />
      </span>
      <Marquee play={play} className="flex-1">
        {text.primary}
        {text.secondary ? (
          <>
            <span aria-hidden="true" className="mx-1.5 text-line">
              |
            </span>
            <span className="font-normal">{text.secondary}</span>
          </>
        ) : null}
      </Marquee>
    </Link>
  );
}

/**
 * Text that ends in a fade when it doesn't fit, and scrolls to its end
 * while `play` is on. Measured on play, so it only moves when cut off;
 * the speed is constant (about 40 px a second), whatever the length.
 */
function Marquee({
  play,
  className,
  children,
}: {
  play: boolean;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!play || !el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const overflow = inner ? inner.scrollWidth - el.clientWidth : 0;
    const frame = requestAnimationFrame(() =>
      setDistance(Math.max(0, overflow)),
    );
    return () => cancelAnimationFrame(frame);
  }, [play]);

  const moving = play && distance > 0;
  return (
    <span
      ref={box}
      className={cn("jb-marquee min-w-0 overflow-hidden", className)}
      data-moving={moving || undefined}
      style={
        moving
          ? ({
              "--marquee-distance": `${distance}px`,
              "--marquee-duration": `${Math.max(2, distance / 40 + 1.5)}s`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span className="jb-marquee-text">{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Preview for /design-system                                          */
/* ------------------------------------------------------------------ */

/** The sidebar in a fixed box, in any state, for the design-system page. */
export function SidebarPreview({
  locale,
  labels,
  collapsed,
  name,
  cvs,
}: {
  locale: Locale;
  labels: ShellLabels;
  collapsed: boolean;
  name: string | null;
  cvs: CvSectionProps;
}) {
  return (
    <TooltipProvider>
      <ShellContext.Provider
        value={{ locale, labels, collapsed, signOut: async () => {} }}
      >
        <div
          className={cn(
            "flex h-[40rem] overflow-y-auto rounded-box bg-desk",
            collapsed ? "w-14" : "w-62",
          )}
        >
          <SidebarContents
            name={name}
            cvList={<CvSection {...cvs} />}
            toApproveCount={collapsed ? undefined : 3}
            onToggle={() => {}}
          />
        </div>
      </ShellContext.Provider>
    </TooltipProvider>
  );
}
