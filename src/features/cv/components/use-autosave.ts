"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { savableContent } from "../editor";
import {
  renameCvAction,
  saveCvAction,
  startEditSessionAction,
} from "../editor-actions";
import { contentIssuePaths } from "../logic";
import type { CvContent } from "../schemas";

/**
 * Autosave for the CV editor (decision 0024 §4). No Save button: changes go
 * out about 1 s after typing stops, or at once when a field or section is
 * left (`flush`). One request at a time; each sends the `updatedAt` it last
 * saw, so another tab's newer save is never overwritten. Only valid content
 * is sent. The first save of a visit snapshots the CV first (a `user`
 * revision). Nothing is written to browser storage.
 */

export type SaveStatus =
  "saved" | "saving" | "pending" | "offline" | "conflict" | "tooLarge";

const DELAY_MS = 1000;

export function useAutosave({
  id,
  initialContent,
  initialUpdatedAt,
}: {
  id: string;
  initialContent: CvContent;
  initialUpdatedAt: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [heldBack, setHeldBack] = useState(0);

  const draft = useRef(initialContent);
  const saved = useRef(initialContent);
  const savedJson = useRef(JSON.stringify(initialContent));
  const updatedAt = useRef(initialUpdatedAt);
  const sessionStarted = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const again = useRef(false);
  const stopped = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Edits are counted, so "unsaved" never depends on key order or trimming.
  const editCount = useRef(0);
  const savedCount = useRef(0);
  const dirty = useCallback(() => editCount.current !== savedCount.current, []);

  const run = useCallback(async (): Promise<void> => {
    if (stopped.current) return;
    const count = editCount.current;
    const next = savableContent(
      draft.current,
      saved.current,
      contentIssuePaths,
    );
    if (!next) {
      setStatus("offline");
      return;
    }
    setHeldBack(next.heldBack);
    const json = JSON.stringify(next.content);
    if (json === savedJson.current) {
      if (next.heldBack === 0) savedCount.current = count;
      setStatus(next.heldBack > 0 ? "pending" : "saved");
      return;
    }

    setStatus("saving");
    try {
      if (!sessionStarted.current) {
        const snapshot = await startEditSessionAction(id);
        if (!snapshot.ok) throw new Error(snapshot.error.code);
        sessionStarted.current = true;
      }
      const result = await saveCvAction(id, next.content, updatedAt.current);
      if (result.ok) {
        saved.current = next.content;
        savedJson.current = json;
        updatedAt.current = result.value.updatedAt;
        if (next.heldBack === 0) savedCount.current = count;
        setStatus(next.heldBack > 0 || dirty() ? "pending" : "saved");
        return;
      }
      if (result.error.code === "conflict") {
        stopped.current = true;
        setStatus("conflict");
        return;
      }
      setStatus(result.error.code === "too_large" ? "tooLarge" : "offline");
    } catch {
      setStatus("offline");
    }
  }, [dirty, id]);

  /** Saves now (or right after the request in flight). */
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inFlight.current) {
      again.current = true;
      return inFlight.current;
    }
    inFlight.current = (async () => {
      do {
        again.current = false;
        await run();
      } while (again.current && !stopped.current);
      inFlight.current = null;
    })();
    return inFlight.current;
  }, [run]);

  /** Every edit goes through here. */
  const update = useCallback(
    (recipe: (current: CvContent) => CvContent) => {
      const next = recipe(draft.current);
      draft.current = next;
      editCount.current += 1;
      setContent(next);
      if (stopped.current) return;
      setStatus((s) => (s === "saving" ? s : "pending"));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DELAY_MS);
    },
    [flush],
  );

  /** Renames through the same queue, so the version check stays right. */
  const rename = useCallback(
    async (title: string) => {
      await inFlight.current;
      const result = await renameCvAction(id, title);
      if (result.ok) updatedAt.current = result.value.updatedAt;
      return result;
    },
    [id],
  );

  // Retry when the connection comes back.
  useEffect(() => {
    const online = () => {
      if (dirty()) void flush();
    };
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [dirty, flush]);

  // The browser's leave-page warning, only while changes are unsaved.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty()) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { content, update, flush, rename, status, heldBack };
}
