// Fails if the two dictionaries diverge or contain unfinished text.
// Run with: bun scripts/i18n-check.mjs  (Bun transpiles the .ts imports; Node cannot.)
import { en } from "../src/i18n/locales/en.ts";
import { fr } from "../src/i18n/locales/fr.ts";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : flatten(value, `${prefix}${key}.`),
  );

const enKeys = flatten(en).sort();
const frKeys = flatten(fr).sort();
const frSet = new Set(frKeys);
const enSet = new Set(enKeys);

const problems = [];
const missingInFr = enKeys.filter((k) => !frSet.has(k));
const notInEn = frKeys.filter((k) => !enSet.has(k));
if (missingInFr.length) problems.push(`missing in fr: ${missingInFr.join(", ")}`);
if (notInEn.length) problems.push(`not in en: ${notInEn.join(", ")}`);

const values = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "string" ? [[`${prefix}${key}`, value]] : values(value, `${prefix}${key}.`),
  );

for (const [path, value] of [...values(en), ...values(fr)]) {
  if (/TODO|TBD|FIXME|XXX/.test(value)) problems.push(`placeholder text at ${path}`);
  if (value.trim() === "") problems.push(`empty value at ${path}`);
}

if (problems.length) {
  console.error("i18n check failed:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`i18n check ok — ${enKeys.length} keys, en/fr in sync`);
