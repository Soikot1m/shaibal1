// Loads variables from `.env` for standalone scripts (seed, maintenance).
// Next.js loads `.env` on its own; this is only for `npx tsx ...` commands.
// Existing process variables always win over the file.
import { config } from "dotenv";

config({ quiet: true });
