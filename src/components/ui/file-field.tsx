"use client";

import { useRef, useState, type DragEvent } from "react";

import { HugeiconsFileTextIcon, HugeiconsUploadIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Field } from "./field";

type FileFieldProps = {
  name: string;
  label: string;
  /** e.g. "PDF, up to 5 MB." */
  hint?: string;
  /** The button's label: "Choose a PDF". */
  chooseLabel: string;
  /** After the button on fine pointers: "or drop it here". */
  dropLabel: string;
  removeLabel: string;
  /** MIME types or extensions, as the input's `accept`. */
  accept: string;
  /** Format the chosen file's size ("1.2 MB"); the caller owns the locale. */
  formatSize: (bytes: number) => string;
  error?: string | null;
  disabled?: boolean;
  /** Shown but not changeable (a form that's submitting). */
  readOnly?: boolean;
  required?: boolean;
  onChange?: (file: File | null) => void;
  className?: string;
};

/** Whether a file matches an `accept` list of MIME types and extensions. */
export function accepts(accept: string, file: File): boolean {
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .some((a) =>
      a.startsWith(".")
        ? file.name.toLowerCase().endsWith(a)
        : a === file.type.toLowerCase(),
    );
}

/**
 * One file, chosen with a button or dropped (spec 31). The real input stays
 * in the form, so the file posts with it; a drop is copied into the input.
 * Every state: empty, drag-over (fine pointers), chosen, invalid, disabled,
 * read-only. Light and dark through tokens.
 */
export function FileField({
  name,
  label,
  hint,
  chooseLabel,
  dropLabel,
  removeLabel,
  accept,
  formatSize,
  error,
  disabled,
  readOnly,
  required,
  onChange,
  className,
}: FileFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [over, setOver] = useState(false);
  const locked = disabled || readOnly;

  const choose = (next: File | null) => {
    setFile(next);
    onChange?.(next);
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    if (locked || !input.current) return;
    const dropped = event.dataTransfer.files[0];
    // The picker filters by `accept`; a drop doesn't, so check it here.
    if (!dropped || !accepts(accept, dropped)) return;
    const list = new DataTransfer();
    list.items.add(dropped);
    input.current.files = list.files;
    choose(dropped);
  };

  const remove = () => {
    if (input.current) input.current.value = "";
    choose(null);
    input.current?.focus();
  };

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
      className={className}
    >
      <div
        onDragOver={(e) => {
          if (locked) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
        data-over={over || undefined}
        data-invalid={error ? true : undefined}
        className={cn(
          "flex min-w-0 flex-col gap-3 rounded-control-lg border border-dashed border-line bg-well p-4 sm:flex-row sm:items-center",
          "transition-colors duration-(--dur-fast) ease-standard",
          "data-over:border-violet data-over:bg-tint",
          "data-invalid:border-danger",
          disabled && "opacity-60",
        )}
      >
        {/* Visually hidden, still in the form and reachable by label. */}
        <input
          ref={input}
          type="file"
          name={name}
          accept={accept}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <HugeiconsFileTextIcon
                size={20}
                className="shrink-0 text-ink-muted"
              />
              <span
                className="min-w-0 truncate font-semibold"
                title={file.name}
              >
                {file.name}
              </span>
              <span className="shrink-0 text-sm text-ink-muted">
                {formatSize(file.size)}
              </span>
            </span>
            {readOnly ? null : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={remove}
                className="self-start sm:self-auto"
              >
                {removeLabel}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              icon={<HugeiconsUploadIcon />}
              disabled={locked}
              onClick={() => input.current?.click()}
              className="self-start"
            >
              {chooseLabel}
            </Button>
            <span className="hidden text-sm text-ink-muted pointer-fine:inline">
              {dropLabel}
            </span>
          </>
        )}
      </div>
    </Field>
  );
}
