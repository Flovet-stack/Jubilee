"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";

import { JubileeIcon } from "@/components/brand/jubilee-icon";
import { JubileeLogo } from "@/components/brand/jubilee-logo";
import {
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
import pkg from "../../../../package.json";
import { cn } from "@/lib/utils";

import {
  activeNav,
  COLLAPSE_COOKIE,
  COLLAPSE_COOKIE_MAX_AGE,
  NAV_ITEMS,
  type NavKey,
  pathInLocale,
  pathWithoutLocale,
} from "../logic";
import { LanguageIcon, LogOutIcon, MoonIcon } from "./menu-icons";
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
  terms: string;
  localeShort: Record<Locale, string>;
  localeNames: Record<Locale, string>;
  cvs: {
    title: string;
    short: string;
    create: string;
    reassure: string;
    error: string;
    retry: string;
  };
};

export type ShellCv = {
  id: string;
  title: string;
  tag: string;
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
        <Link
          href={`/${locale}/home`}
          aria-label={labels.home}
          className={cn(
            "flex min-h-11 min-w-0 flex-1 items-center rounded-control px-2 text-ink outline-none focus-visible:shadow-[0_0_0_2px_var(--violet)]",
            collapsed && "flex-none justify-center px-0",
          )}
        >
          {/* The real logo files (0010, 0019): the full logo, or the mark in the rail. */}
          {collapsed ? (
            <JubileeIcon height={28} />
          ) : (
            <JubileeLogo height={22} />
          )}
        </Link>
        {inSheet ? null : <Notifications />}
        {onToggle ? (
          <IconButton
            label={collapsed ? labels.expand : labels.collapse}
            tooltip={collapsed}
            aria-expanded={!collapsed}
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
  const shown = name ?? labels.account;

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
    </button>
  );

  // Menu rows: 44 px on every pointer (0029 rows exception).
  const row =
    "jb-type flex min-h-11 w-full cursor-pointer items-center rounded-mark text-start text-base text-ink outline-none select-none hover-fine:bg-wash-hover focus-visible:shadow-[inset_0_0_0_2px_var(--violet)] [&_svg]:stroke-[1.75]";

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) setDark(isDarkNow());
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
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 outline-none"
        >
          <Popover.Popup
            aria-label={labels.account}
            className={cn(
              "flex w-[min(20rem,var(--available-width))] flex-col rounded-box border border-line bg-card p-2 text-ink shadow-menu outline-none",
              "origin-(--transform-origin) transition-[opacity,scale] duration-(--dur-base) ease-enter",
              "data-starting-style:scale-(--pop-scale) data-starting-style:opacity-0",
              "data-ending-style:scale-(--pop-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dur-exit) data-ending-style:ease-exit",
            )}
          >
            {/* Who: photo, name, plan. No email: they know it. */}
            <div className="flex items-center gap-3 p-2">
              {name ? (
                <Avatar name={name} size="md" className="rounded-control" />
              ) : (
                <span className="jb-type flex size-10 items-center justify-center rounded-control bg-tint text-violet">
                  <span className="jb-type-icon">
                    <HugeiconsUserIcon />
                  </span>
                </span>
              )}
              <div className="flex min-w-0 flex-col items-start gap-1">
                <Popover.Title className="max-w-full truncate text-base font-semibold">
                  {shown}
                </Popover.Title>
                <Badge tone="violet">{labels.plan}</Badge>
              </div>
            </div>
            <Divider />

            <Switch
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
              className="jb-type rounded-mark"
            />
            <Divider />

            <Link href={`/${locale}/settings`} className={row}>
              <span className="jb-type-icon text-ink-muted">
                <HugeiconsSettingsIcon />
              </span>
              {labels.settings}
            </Link>
            <div className="jb-type flex min-h-11 items-center">
              <span className="jb-type-icon text-ink-muted">
                <LanguageIcon />
              </span>
              <span className="flex-1 text-base">{labels.language}</span>
              <LocaleSwitch
                current={locale}
                label={labels.language}
                short={labels.localeShort}
                names={labels.localeNames}
                onPick={(next) => {
                  rememberLocale(next);
                  router.push(pathInLocale(pathname, next));
                }}
              />
            </div>
            <Divider />

            <button
              type="button"
              disabled={pending}
              className={cn(row, "text-danger hover-fine:bg-wash-danger")}
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

            <p className="px-2 pt-2 pb-1 text-sm text-ink-subtle">
              v{pkg.version} ·{" "}
              <Link
                href={`/${locale}/terms`}
                className="underline-offset-2 hover-fine:text-ink hover-fine:underline"
              >
                {labels.terms}
              </Link>
            </p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Divider() {
  return <hr className="my-1 border-line" />;
}

/**
 * Three-way language switch (en-us, en-gb, fr-fr). A radio group: arrow
 * keys move between the options, and the current one is announced.
 */
function LocaleSwitch({
  current,
  label,
  short,
  names,
  onPick,
}: {
  current: Locale;
  label: string;
  short: Record<Locale, string>;
  names: Record<Locale, string>;
  onPick: (locale: Locale) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-control bg-well p-0.5"
    >
      {locales.map((l, index) => {
        const on = l === current;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={names[l]}
            title={names[l]}
            lang={localeTag(l)}
            tabIndex={on ? 0 : -1}
            onClick={() => {
              if (!on) onPick(l);
            }}
            onKeyDown={(event) => {
              const forward = ["ArrowRight", "ArrowDown"].includes(event.key);
              const back = ["ArrowLeft", "ArrowUp"].includes(event.key);
              if (!forward && !back) return;
              event.preventDefault();
              const step = forward ? 1 : locales.length - 1;
              const next = locales[(index + step) % locales.length];
              if (next) onPick(next);
            }}
            className={cn(
              "jb-type jb-type-badge min-h-8 rounded-control-sm text-xs font-semibold whitespace-nowrap outline-none pointer-coarse:min-h-11",
              "focus-visible:shadow-[inset_0_0_0_2px_var(--violet)]",
              on
                ? "bg-card text-ink shadow-thumb"
                : "text-ink-muted hover-fine:text-ink",
            )}
          >
            {short[l]}
          </button>
        );
      })}
    </div>
  );
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

  const list = (inPopover: boolean) => {
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
    return (
      <ul
        className={cn(
          "flex flex-col gap-0.5 overflow-y-auto overscroll-contain",
          inPopover ? "max-h-80" : "max-h-[calc(8*2.625rem)]",
        )}
      >
        {props.cvs.map((cv) => {
          const href = `/${locale}/cvs/${cv.id}`;
          const current = pathname === href;
          return (
            <li key={cv.id}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={rowClasses(current, false)}
                title={cv.title}
              >
                <span className="jb-type-icon text-ink-muted">
                  <HugeiconsFileTextIcon />
                </span>
                <span className="min-w-0 flex-1 truncate">{cv.title}</span>
                <span className="shrink-0 text-xs font-semibold text-ink-subtle">
                  {cv.tag}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
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
                {list(true)}
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
      {list(false)}
    </section>
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
