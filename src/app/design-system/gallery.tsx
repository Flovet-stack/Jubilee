"use client";

import { type ReactNode, useState } from "react";

import * as Icons from "@/components/icons";
import {
  HugeiconsArrowRightIcon,
  HugeiconsCalendarIcon,
  HugeiconsCopyIcon,
  HugeiconsMailIcon,
  MoreIcon,
  HugeiconsPencilIcon,
  HugeiconsPlusIcon,
  HugeiconsSearchIcon,
  HugeiconsSendIcon,
  HugeiconsSettingsIcon,
  HugeiconsTrashIcon,
} from "@/components/icons";
import { Badge, StageBadge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, OverlayClose, Sheet } from "@/components/ui/dialog";
import { Alert, Avatar, Progress, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Menu } from "@/components/ui/menu";
import {
  EmptyState,
  MarkedChange,
  ReviewPanel,
  UndoLine,
} from "@/components/ui/patterns";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardLink, NextStep, Well } from "@/components/ui/surface";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { TextLink } from "@/components/ui/text-link";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

/* Sample content: fictional companies only (no-ai-slop). */

const COLOURS = [
  ["page", "Page"],
  ["well", "Well"],
  ["card", "Card"],
  ["line", "Line"],
  ["tint", "Tint"],
  ["field", "Field"],
  ["ink", "Ink"],
  ["ink-muted", "Ink muted"],
  ["ink-subtle", "Ink subtle"],
  ["violet", "Violet"],
  ["violet-press", "Violet press"],
  ["marigold", "Marigold"],
  ["pink", "Pink (confetti)"],
  ["sky", "Sky (confetti)"],
  ["success", "Success"],
  ["danger", "Danger"],
] as const;

const TYPE = [
  ["text-4xl", "40 · Page title"],
  ["text-3xl", "32 · Screen title"],
  ["text-2xl", "24 · Section"],
  ["text-xl", "20 · Card title"],
  ["text-lg", "18 · Lead"],
  ["text-base", "16 · Body"],
  ["text-sm", "14 · Meta and labels"],
  ["text-xs", "12 · Fine print"],
] as const;

const SPACE = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const MOTION = [
  ["--dur-fast", "120 ms", "Hover in, press, checkbox"],
  ["--dur-exit", "150 ms", "Hover out, anything leaving"],
  ["--dur-base", "200 ms", "Popover, tab, reveal"],
  ["--dur-slow", "320 ms", "Sheet, a card settling (ceiling)"],
  ["--ease-enter", "cubic-bezier(0.05, 0.7, 0.1, 1)", "Entering"],
  ["--ease-exit", "cubic-bezier(0.3, 0, 0.8, 0.15)", "Leaving"],
  ["--ease-standard", "cubic-bezier(0.2, 0, 0, 1)", "Moving on screen"],
  ["--ease-sheet", "cubic-bezier(0.32, 0.72, 0, 1)", "Sheets (iOS curve)"],
] as const;

const COUNTRIES = [
  { value: "cm", label: "Cameroon" },
  { value: "fr", label: "France" },
  { value: "ca", label: "Canada" },
  { value: "be", label: "Belgium" },
  { value: "ci", label: "Côte d'Ivoire" },
  { value: "sn", label: "Senegal" },
  { value: "uk", label: "United Kingdom", disabled: true },
];

export function Gallery() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="mx-auto flex w-full max-w-(--container-content) flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl">Design system</h1>
            <p className="max-w-(--container-reading) text-lg text-ink-muted">
              Every token and component in every state. Decisions 0007, 0008 and
              0009; guide in docs/design/design-system.md. Switch your system
              theme to see dark.
            </p>
          </header>

          <Foundations />
          <Buttons />
          <Forms />
          <Containers />
          <Status />
          <Overlays />
          <Navigation />
          <JubileePatterns />
          <IconSet />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">{title}</h2>
        {intro ? (
          <p className="max-w-(--container-reading) text-ink-muted">{intro}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-ink-muted">{label}</h3>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </div>
  );
}

/* ── Foundations ────────────────────────────────────────────────────── */

function Foundations() {
  return (
    <Section
      title="Foundations"
      intro="Values from 0007. Components read the role names, never the hex."
    >
      <Well title="Colour roles">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {COLOURS.map(([token, name]) => (
            <Card key={token} className="gap-3 p-3">
              <span
                className="h-12 rounded-control shadow-[inset_0_0_0_1px_var(--line)]"
                style={{ background: `var(--${token})` }}
              />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{name}</span>
                <code className="text-xs text-ink-muted">--{token}</code>
              </span>
            </Card>
          ))}
        </div>
      </Well>

      <div className="grid gap-6 lg:grid-cols-2">
        <Well title="Type scale · Plus Jakarta Sans">
          <Card className="gap-4">
            {TYPE.map(([size, label]) => (
              <p
                key={size}
                className={`${size} ${size.match(/xl|lg/) ? "font-bold tracking-[-0.01em]" : ""} truncate`}
              >
                {label}
              </p>
            ))}
            <p className="text-sm text-ink-muted tabular-nums">
              Tabular figures: 12 Dec · 82% · 1,240
            </p>
          </Card>
        </Well>

        <div className="flex flex-col gap-6">
          <Well title="Spacing (4 px base)">
            <Card className="gap-2">
              {SPACE.map((px) => (
                <div key={px} className="flex items-center gap-3">
                  <code className="w-10 text-xs text-ink-muted tabular-nums">
                    {px}
                  </code>
                  <span
                    className="h-3 rounded-full bg-violet"
                    style={{ width: px }}
                  />
                </div>
              ))}
            </Card>
          </Well>
          <Well title="Radius by role">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["rounded-paper", "2 · CV paper"],
                ["rounded-mark", "4 · Checkbox"],
                ["rounded-control", "8 · Controls"],
                ["rounded-box", "12 · Cards, wells"],
                ["rounded-sheet", "16 · Sheets"],
              ].map(([cls, label]) => (
                <Card key={cls} className="items-center gap-2 p-3 text-center">
                  <span className={`size-12 bg-tint ${cls}`} />
                  <span className="text-xs text-ink-muted">{label}</span>
                </Card>
              ))}
            </div>
          </Well>
        </div>
      </div>

      <Well title="Motion">
        <Card className="gap-0 p-0">
          {MOTION.map(([token, value, use]) => (
            <div
              key={token}
              className="grid gap-1 px-4 py-3 not-first:shadow-[inset_0_1px_0_var(--line)] sm:grid-cols-[12rem_1fr_1fr]"
            >
              <code className="text-sm font-semibold">{token}</code>
              <code className="text-sm text-ink-muted">{value}</code>
              <span className="text-sm text-ink-muted">{use}</span>
            </div>
          ))}
        </Card>
        <MotionDemo />
      </Well>
    </Section>
  );
}

function MotionDemo() {
  const [on, setOn] = useState(false);
  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Press repeatedly: transitions retarget mid-flight instead of jumping.
        </p>
        <Button size="sm" onClick={() => setOn((v) => !v)}>
          Move
        </Button>
      </div>
      <div className="@container relative h-10 rounded-full bg-well">
        <span
          className="absolute top-1 left-1 size-8 rounded-full bg-violet transition-[translate] duration-(--dur-slow) ease-standard"
          style={{ translate: on ? "calc(100cqw - 100% - 8px)" : "0" }}
        />
      </div>
    </Card>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────── */

function Buttons() {
  const [loading, setLoading] = useState(false);
  return (
    <Section
      title="Buttons"
      intro="One primary per screen. Hover is colour only (fine pointers); press scales to 0.98. Loading keeps the width and blocks a second click."
    >
      <Well>
        <Card className="gap-6">
          <Row label="Variants">
            <Button variant="primary">Tailor my CV</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="quiet">Skip for now</Button>
            <Button variant="danger" icon={<HugeiconsTrashIcon />}>
              Delete this CV
            </Button>
          </Row>
          <Row label="Small (44 px) and with icons">
            <Button size="sm" variant="primary" icon={<HugeiconsPlusIcon />}>
              Add job
            </Button>
            <Button size="sm" iconEnd={<HugeiconsArrowRightIcon />}>
              Next
            </Button>
            <Button size="sm" variant="quiet" icon={<HugeiconsCopyIcon />}>
              Duplicate
            </Button>
          </Row>
          <Row label="Disabled and loading">
            <Button variant="primary" disabled>
              Send application
            </Button>
            <Button disabled>Preview</Button>
            <Button
              variant="primary"
              loading={loading}
              loadingLabel="Sending"
              icon={<HugeiconsSendIcon />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2400);
              }}
            >
              Send to Sawa Logistics
            </Button>
            <Button loading>Saving</Button>
          </Row>
          <Row label="Icon only (always named; label shows as a tooltip)">
            <IconButton label="Edit section" icon={<HugeiconsPencilIcon />} />
            <IconButton
              label="Settings"
              variant="secondary"
              icon={<HugeiconsSettingsIcon />}
            />
            <IconButton
              label="Search jobs"
              size="sm"
              icon={<HugeiconsSearchIcon />}
            />
            <IconButton label="Saving" loading icon={<HugeiconsPencilIcon />} />
            <IconButton label="Delete" disabled icon={<HugeiconsTrashIcon />} />
          </Row>
          <Row label="Long French label wraps, never clips (320 px)">
            <div className="w-80">
              <Button variant="primary" fullWidth>
                Envoyer ma candidature à Sawa Logistics et Nkam Clearing
              </Button>
            </div>
          </Row>
          <Row label="Text link">
            <p className="max-w-(--container-reading)">
              Read the <TextLink href="#">CV guide for Cameroon</TextLink> or
              open the{" "}
              <TextLink
                href="https://example.com"
                external
                externalHint="(opens in a new tab)"
              >
                job post
              </TextLink>
              .
            </p>
          </Row>
        </Card>
      </Well>
    </Section>
  );
}

/* ── Forms ──────────────────────────────────────────────────────────── */

function Forms() {
  const [country, setCountry] = useState<string | null>(null);
  const [email, setEmail] = useState("flo@");
  const emailError =
    email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
      ? "Enter an email address like name@example.com"
      : undefined;
  return (
    <Section
      title="Forms"
      intro="Label above, hint under it, error replaces nothing and says how to fix it. Optional fields are marked; required ones aren't."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Well title="Text fields">
          <Card className="gap-6">
            <Field label="Full name">
              <Input defaultValue="Flora Mbah" autoComplete="name" />
            </Field>
            <Field
              label="Email"
              hint="Employers reply here. We never share it."
              error={emailError}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                icon={<HugeiconsMailIcon />}
              />
            </Field>
            <Field label="Job title" optionalLabel="(optional)">
              <Input placeholder="e.g. Logistics coordinator" />
            </Field>
            <Field label="Search" hint="With an icon and a clear button.">
              <Input
                icon={<HugeiconsSearchIcon />}
                defaultValue="customs"
                end={
                  <IconButton
                    label="Clear search"
                    size="sm"
                    tooltip={false}
                    icon={<Icons.HugeiconsXIcon size={18} />}
                  />
                }
              />
            </Field>
            <Field label="Account ID" hint="Read-only: focusable, copyable.">
              <Input readOnly defaultValue="JB-20431" />
            </Field>
            <Field label="Phone" disabled>
              <Input defaultValue="+237 6 00 00 00 00" />
            </Field>
            <Field
              label="Summary"
              hint="Two or three lines employers read first."
            >
              <Textarea
                showCount
                maxLength={280}
                defaultValue="Logistics coordinator with 6 years at the Port of Douala, moving 1,200 containers a month."
              />
            </Field>
          </Card>
        </Well>

        <div className="flex flex-col gap-6">
          <Well title="Select">
            <Card className="gap-6">
              <Field label="Country of the job">
                <Select
                  items={COUNTRIES}
                  value={country}
                  onValueChange={setCountry}
                  placeholder="Choose a country"
                />
              </Field>
              <Field label="Empty list">
                <Select
                  items={[]}
                  placeholder="No saved CVs yet"
                  emptyText="Create a CV first."
                />
              </Field>
              <Field label="Disabled" disabled>
                <Select items={COUNTRIES} placeholder="Choose" disabled />
              </Field>
            </Card>
          </Well>

          <Well title="Choices">
            <Card className="gap-6">
              <div className="flex flex-col">
                <Checkbox label="Unchecked" />
                <Checkbox label="Checked" defaultChecked />
                <Checkbox
                  label="Some sections included"
                  description="Indeterminate: part of a group is on."
                  indeterminate
                />
                <Checkbox label="Disabled" disabled />
                <Checkbox
                  label="Disabled and checked"
                  disabled
                  defaultChecked
                />
              </div>
              <RadioGroup
                legend="CV language"
                defaultValue="fr"
                options={[
                  { value: "fr", label: "French" },
                  { value: "en", label: "English" },
                  {
                    value: "both",
                    label: "Both",
                    description: "Two files, one per language.",
                  },
                  { value: "de", label: "German", disabled: true },
                ]}
              />
              <RadioGroup
                legend="How do you want to start?"
                appearance="cards"
                defaultValue="import"
                options={[
                  {
                    value: "import",
                    label: "Import from LinkedIn",
                    description: "We read your profile; you check every line.",
                  },
                  {
                    value: "upload",
                    label: "Upload a CV",
                    description: "PDF or Word, up to 5 MB.",
                  },
                ]}
              />
              <RadioGroup
                legend="Notice period"
                error="Choose how soon you can start"
                options={[
                  { value: "now", label: "Now" },
                  { value: "month", label: "Within a month" },
                ]}
              />
              <div className="flex flex-col">
                <Switch
                  label="Follow-up reminders"
                  description="We draft them; you send them."
                  defaultChecked
                />
                <Switch label="Job alerts by email" />
                <Switch label="Disabled" disabled />
              </div>
            </Card>
          </Well>
        </div>
      </div>
    </Section>
  );
}

/* ── Containers ─────────────────────────────────────────────────────── */

function Containers() {
  return (
    <Section
      title="Containers"
      intro="A grey well holds white cards (Clemta pattern). One level only. Only clickable cards react to hover."
    >
      <NextStep
        title="2 follow-ups are ready"
        icon={<HugeiconsMailIcon />}
        action={<Button variant="primary">Review follow-ups</Button>}
      >
        Sawa Logistics and Nkam Clearing haven&apos;t replied in 10 days.
      </NextStep>
      <Well
        title="Saved jobs"
        actions={<span className="text-sm text-ink-muted tabular-nums">3</span>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <CardLink href="#">
            <span className="font-bold">Logistics coordinator</span>
            <span className="text-sm text-ink-muted">
              Sawa Logistics · Douala
            </span>
            <StageBadge stage="saved" label="Saved" />
          </CardLink>
          <CardLink href="#">
            <span className="font-bold">Customs declarant</span>
            <span className="text-sm text-ink-muted">
              Nkam Clearing · Kribi
            </span>
            <StageBadge stage="interview" label="Interview" />
          </CardLink>
          <Card>
            <span className="font-bold">Static card</span>
            <span className="text-sm text-ink-muted">
              Not clickable, so no hover.
            </span>
          </Card>
        </div>
      </Well>
    </Section>
  );
}

/* ── Status ─────────────────────────────────────────────────────────── */

function Status() {
  return (
    <Section
      title="Status"
      intro="Badges carry real state only. Stages have a fixed colour, a mark and a word; rejected is warm grey, never red."
    >
      <Well>
        <Card className="gap-6">
          <Row label="Tracker stages">
            <StageBadge stage="saved" label="Saved" />
            <StageBadge stage="applied" label="Applied" />
            <StageBadge stage="interview" label="Interview" />
            <StageBadge stage="offer" label="Offer" />
            <StageBadge stage="rejected" label="Not selected" />
          </Row>
          <Row label="Badges">
            <Badge>Draft</Badge>
            <Badge tone="violet">Follow-up ready</Badge>
            <Badge tone="success" icon={<Icons.HugeiconsCheckIcon size={16} />}>
              Sent
            </Badge>
            <Badge tone="danger">Couldn&apos;t send</Badge>
            <Badge tone="marigold">Offer received</Badge>
            <span className="w-40">
              <Badge title="Responsable logistique et transit international">
                Responsable logistique et transit international
              </Badge>
            </span>
          </Row>
          <div className="grid gap-4 lg:grid-cols-2">
            <Alert tone="info" title="Your CV follows the Cameroon format">
              One page, photo optional, languages near the top.
            </Alert>
            <Alert tone="success" title="Application sent to Sawa Logistics">
              We&apos;ll draft a follow-up on 1 December.
            </Alert>
            <Alert
              tone="warning"
              title="2 sections are longer than employers read"
              action={<Button size="sm">Shorten them</Button>}
            >
              Experience and Skills.
            </Alert>
            <Alert
              tone="danger"
              title="We couldn't send your application"
              dismissLabel="Dismiss"
              onDismiss={() => undefined}
            >
              Nothing was sent. Check your connection and try again.
            </Alert>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Progress value={82} label="Match" valueText="82%" />
              <Progress
                value={40}
                label="Profile complete"
                valueText="4 of 10"
              />
            </div>
            <div className="flex flex-col gap-3" aria-hidden="true">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="w-full" />
              <Skeleton className="w-5/6" />
            </div>
          </div>
          <Row label="Avatar and spinner">
            <Avatar name="Flora Mbah" size="sm" />
            <Avatar name="Flora Mbah" />
            <Avatar name="Jean-Paul Nkam" size="lg" />
            <Avatar name="" />
            <Spinner label="Loading" delay="none" />
            <span className="text-violet">
              <Spinner label="Loading" delay="none" size={24} />
            </span>
          </Row>
        </Card>
      </Well>
    </Section>
  );
}

/* ── Overlays ───────────────────────────────────────────────────────── */

function Overlays() {
  const toast = useToast();
  return (
    <Section
      title="Overlays"
      intro="Each traps focus, closes with Esc and a visible Close, returns focus, and locks scroll. Popovers grow from their trigger."
    >
      <Well>
        <Card className="gap-6">
          <Row label="Dialog, sheet, menu, tooltip">
            <Dialog
              trigger={<Button>Open dialog</Button>}
              title="Delete this CV?"
              description="Nkam Clearing has an application that uses it. The application keeps its copy."
              closeLabel="Close"
              footer={
                <>
                  <OverlayClose>
                    <Button variant="quiet">Keep it</Button>
                  </OverlayClose>
                  <OverlayClose>
                    <Button variant="danger" icon={<HugeiconsTrashIcon />}>
                      Delete &quot;Logistics CV&quot;
                    </Button>
                  </OverlayClose>
                </>
              }
            />
            <Sheet
              trigger={<Button>Open sheet</Button>}
              title="Why this job matches"
              description="82% match with Logistics coordinator"
              closeLabel="Close"
              footer={
                <OverlayClose>
                  <Button variant="primary">Tailor my CV</Button>
                </OverlayClose>
              }
            >
              <div className="flex flex-col gap-4">
                <Progress value={82} label="Match" valueText="82%" />
                <ul className="flex list-disc flex-col gap-2 ps-5 text-ink-muted">
                  <li>6 years in port logistics (they ask for 4)</li>
                  <li>French and English, as listed</li>
                  <li>Missing: SAP experience</li>
                </ul>
              </div>
            </Sheet>
            <Menu
              trigger={
                <Button iconEnd={<Icons.HugeiconsChevronDownIcon />}>
                  Move to
                </Button>
              }
              items={[
                {
                  label: "Applied",
                  icon: <HugeiconsSendIcon />,
                  onSelect: () => undefined,
                },
                {
                  label: "Interview",
                  icon: <HugeiconsCalendarIcon />,
                  onSelect: () => undefined,
                },
                { label: "Offer", onSelect: () => undefined, disabled: true },
                { type: "separator" },
                {
                  label: "Delete job",
                  icon: <HugeiconsTrashIcon />,
                  tone: "danger",
                  onSelect: () => undefined,
                },
              ]}
            />
            <Menu
              align="end"
              trigger={<IconButton label="More actions" icon={<MoreIcon />} />}
              items={[
                {
                  label: "Duplicate",
                  icon: <HugeiconsCopyIcon />,
                  onSelect: () => undefined,
                },
                {
                  label: "Rename",
                  icon: <HugeiconsPencilIcon />,
                  onSelect: () => undefined,
                },
              ]}
            />
            <Tooltip content="Matches 'logistics' and 'customs' in the post">
              <Button variant="quiet">Hover or focus me</Button>
            </Tooltip>
          </Row>
          <Row label="Toasts (stack of 3, swipe down or right)">
            <Button
              onClick={() =>
                toast({
                  title: "Moved to Interview",
                  type: "success",
                  closeLabel: "Dismiss",
                  action: { label: "Undo", onClick: () => undefined },
                })
              }
            >
              Toast with Undo
            </Button>
            <Button
              onClick={() =>
                toast({
                  title: "Link copied",
                  closeLabel: "Dismiss",
                })
              }
            >
              Plain toast
            </Button>
            <Button
              onClick={() =>
                toast({
                  title: "Couldn't save",
                  description:
                    "Your changes are kept on this device. We'll retry.",
                  type: "danger",
                  closeLabel: "Dismiss",
                })
              }
            >
              Error toast
            </Button>
          </Row>
        </Card>
      </Well>
    </Section>
  );
}

/* ── Navigation ─────────────────────────────────────────────────────── */

function Navigation() {
  return (
    <Section
      title="Tabs"
      intro="The underline slides; panels switch without animation."
    >
      <Well>
        <Card>
          <Tabs
            label="Application details"
            items={[
              {
                value: "cv",
                label: "CV",
                panel: (
                  <p className="text-ink-muted">
                    The CV version sent on 12 Nov.
                  </p>
                ),
              },
              {
                value: "letter",
                label: "Letter",
                panel: (
                  <p className="text-ink-muted">The cover letter as sent.</p>
                ),
              },
              {
                value: "followups",
                label: "Follow-ups",
                meta: 2,
                panel: (
                  <p className="text-ink-muted">Two drafts waiting for you.</p>
                ),
              },
              {
                value: "notes",
                label: "Notes",
                disabled: true,
                panel: null,
              },
            ]}
          />
        </Card>
      </Well>
    </Section>
  );
}

/* ── Jubilee patterns ───────────────────────────────────────────────── */

function JubileePatterns() {
  const [moved, setMoved] = useState(true);
  const [change, setChange] = useState<"pending" | "accepted" | "rejected">(
    "pending",
  );
  return (
    <Section
      title="Jubilee patterns"
      intro="From 0008: undo instead of 'Are you sure?', AI changes as marked changes, and final actions that name exactly what goes out."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Well title="Undo line and marked change">
          <Card className="gap-4">
            {moved ? (
              <UndoLine
                message="Moved to Interview"
                undoLabel="Undo"
                onUndo={() => setMoved(false)}
              />
            ) : (
              <Button size="sm" onClick={() => setMoved(true)}>
                Move again
              </Button>
            )}
            <p>
              Coordinated{" "}
              <MarkedChange
                removed="shipping for a port company"
                added="customs clearance and transit for 1,200 containers a month"
                reason="Matches 'customs' and 'transit' in the Nkam Clearing post. Numbers come from your Experience section."
                acceptLabel="Accept"
                rejectLabel="Reject"
                status={change}
                onAccept={() => setChange("accepted")}
                onReject={() => setChange("rejected")}
              />
            </p>
            {change !== "pending" ? (
              <Button
                size="sm"
                variant="quiet"
                onClick={() => setChange("pending")}
              >
                Show the change again
              </Button>
            ) : null}
          </Card>
        </Well>
        <ReviewPanel
          title="Check what we'll send"
          rows={[
            { label: "To", value: "recrutement@sawa-logistics.example" },
            { label: "CV", value: "Logistics CV · version 3 (French)" },
            { label: "Letter", value: "Tailored for Logistics coordinator" },
            { label: "From", value: "flora.mbah@example.com" },
          ]}
          secondary={<Button variant="quiet">Edit letter</Button>}
          action={
            <Button variant="primary" icon={<HugeiconsSendIcon />}>
              Send to Sawa Logistics
            </Button>
          }
        />
      </div>
      <Well title="Empty state">
        <Card>
          <EmptyState
            title="No applications yet"
            action={<Button variant="primary">Find a job to apply to</Button>}
          >
            Applications you send from Jubilee appear here with the exact CV and
            letter you used.
          </EmptyState>
        </Card>
      </Well>
    </Section>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────── */

function IconSet() {
  const entries = Object.entries(Icons).filter(([name]) =>
    name.endsWith("Icon"),
  );
  return (
    <Section
      title="Icons"
      intro="icons-animated, Hugeicons set. 20 px in UI, 24 px in navigation. They play when their button is hovered or keyboard-focused, never on touch, never with reduced motion."
    >
      <Well>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {entries.map(([name, Icon]) => {
            const Component = Icon as React.ComponentType<{ size?: number }>;
            const label = name
              .replace(/^Hugeicons/, "")
              .replace(/Icon$/, "")
              .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
              .toLowerCase();
            return (
              <button
                key={name}
                type="button"
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-box bg-card px-3 py-3 text-start text-sm shadow-[inset_0_0_0_1px_var(--line)] transition-[box-shadow] duration-(--dur-exit) hover-fine:shadow-[inset_0_0_0_1px_var(--field)] hover-fine:duration-(--dur-fast)"
              >
                <Component size={20} />
                <span className="min-w-0 truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </Well>
    </Section>
  );
}
