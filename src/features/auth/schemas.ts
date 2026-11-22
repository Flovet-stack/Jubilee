import { z } from "zod";

import { CODE_LENGTH } from "./logic";

/** Inputs checked on the server before Supabase sees them (spec 05). */
export const emailSchema = z.email().max(254);

export const codeSchema = z.string().regex(new RegExp(`^\\d{${CODE_LENGTH}}$`));
