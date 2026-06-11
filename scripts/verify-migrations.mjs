#!/usr/bin/env node
/**
 * Verificación estructural de las migraciones de Supabase.
 *
 * Comprueba que:
 *   1. supabase/migrations/ existe y contiene >= 8 archivos .sql
 *   2. No quedan archivos supabase-*.sql en la raíz del repo
 *   3. Ninguna migración contiene la versión buggy de
 *      check_reservation_availability (sin alias de tabla);
 *      la migración que la define DEBE usar "FROM reservations r"
 *   4. La migración de la función fija search_path
 *
 * Uso: node scripts/verify-migrations.mjs
 * Exit code: 0 si todo OK, 1 si algún check falla.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(repoRoot, "supabase", "migrations");

const results = [];
let failed = false;

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
}

/** Elimina líneas de comentario SQL (-- ...) para evitar falsos positivos. */
function stripSqlComments(sql) {
  return sql
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .join("\n");
}

// ---------------------------------------------------------------
// Check 1: directorio de migraciones con >= 8 archivos .sql
// ---------------------------------------------------------------
let migrationFiles = [];
if (existsSync(migrationsDir)) {
  migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  check(
    "supabase/migrations/ contiene >= 8 migraciones .sql",
    migrationFiles.length >= 8,
    `encontradas: ${migrationFiles.length}`
  );
} else {
  check("supabase/migrations/ existe", false, "directorio no encontrado");
}

// ---------------------------------------------------------------
// Check 2: cero supabase-*.sql en la raíz del repo
// ---------------------------------------------------------------
const rootSqlFiles = readdirSync(repoRoot).filter(
  (f) => f.startsWith("supabase-") && f.endsWith(".sql")
);
check(
  "cero archivos supabase-*.sql en la raíz",
  rootSqlFiles.length === 0,
  rootSqlFiles.length > 0 ? `presentes: ${rootSqlFiles.join(", ")}` : ""
);

// ---------------------------------------------------------------
// Checks 3 y 4: la función check_reservation_availability solo
// existe en su versión corregida (alias explícitos) y con
// search_path fijado.
// ---------------------------------------------------------------
let fnDefinitions = 0;
for (const file of migrationFiles) {
  const raw = readFileSync(join(migrationsDir, file), "utf8");
  const code = stripSqlComments(raw);

  if (!/check_reservation_availability/i.test(code)) continue;
  fnDefinitions += 1;

  // Aserción positiva: la versión corregida cuenta reservas con alias "r"
  const hasAliasedFrom = /FROM\s+reservations\s+r\b/i.test(code);
  check(
    `${file}: define check_reservation_availability con alias (FROM reservations r)`,
    hasAliasedFrom,
    hasAliasedFrom ? "" : "no se encontró el patrón con alias — posible versión buggy"
  );

  // Aserción negativa: ningún SELECT de reservas sin alias (patrón buggy)
  const hasUnaliasedFrom = /FROM\s+reservations\s*(\n|;|WHERE)/i.test(code);
  check(
    `${file}: sin la variante buggy (FROM reservations sin alias)`,
    !hasUnaliasedFrom,
    hasUnaliasedFrom ? "se encontró FROM reservations sin alias" : ""
  );

  // search_path fijado (advisor function_search_path_mutable)
  check(
    `${file}: la función fija search_path`,
    /set\s+search_path/i.test(code),
    ""
  );
}

check(
  "al menos una migración define check_reservation_availability",
  fnDefinitions >= 1,
  `definiciones encontradas: ${fnDefinitions}`
);

// ---------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------
console.log("Verificación estructural de migraciones\n");
for (const { name, ok, detail } of results) {
  const status = ok ? "OK  " : "FAIL";
  console.log(`  [${status}] ${name}${detail ? ` (${detail})` : ""}`);
}
console.log(
  `\n${failed ? "FALLO: hay checks en rojo." : "Todo OK: estructura de migraciones válida."}`
);
process.exit(failed ? 1 : 0);
