const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../sample-data/products.xlsx");
const wb = XLSX.readFile(file);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

function esc(s) {
  return String(s).replace(/'/g, "''");
}
function toInt(x) {
  const n = Number(String(x).replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}
function yesNoToBool(x) {
  const v = String(x).trim().toLowerCase();
  return v === "sí" || v === "si" || v === "true" || v === "1";
}

let sql = "BEGIN TRANSACTION;\n";
sql += "DELETE FROM product_price_tiers;\n";
sql += "DELETE FROM cart_items;\n";
sql += "DELETE FROM carts;\n";
sql += "DELETE FROM products;\n";

for (const r of rows) {
  const id = toInt(r.ID);

  const tipo = esc(r.TIPO_PRENDA);
  const talla = esc(r.TALLA);
  const color = esc(r.COLOR);
  const cat = esc(r["CATEGORÍA"] ?? r.CATEGORIA);
  const desc = esc(r["DESCRIPCIÓN"] ?? r.DESCRIPCION);

  const stock = toInt(r.CANTIDAD_DISPONIBLE);
  const p50 = toInt(r.PRECIO_50_U);
  const p100 = toInt(r.PRECIO_100_U);
  const p200 = toInt(r.PRECIO_200_U);

  const disponible = yesNoToBool(r.DISPONIBLE) ? 1 : 0;

  // nombre legible para el agente
  const name = esc(`${tipo} ${color} ${talla} - ${cat}`.trim());

  sql += `INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (${id},'${name}','${desc}',${p50},${stock},'${tipo}','${talla}','${color}','${cat}',${disponible});\n`;

  sql += `INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (${id},50,${p50});\n`;
  sql += `INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (${id},100,${p100});\n`;
  sql += `INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (${id},200,${p200});\n`;
}

sql += "COMMIT;\n";

const out = path.join(__dirname, "../seed.sql");
fs.writeFileSync(out, sql, "utf8");
console.log("✅ seed.sql generado en worker/seed.sql");
console.log("Filas:", rows.length);
