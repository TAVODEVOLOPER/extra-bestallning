/**
 * Extra beställning – API en Google Apps Script
 *
 * Script vinculado a la hoja de Google Sheets donde se registran los pedidos.
 * Recibe el pedido (JSON) desde la web en GitHub Pages, guarda el PDF en Drive
 * y añade una fila a la hoja.
 *
 * Código de acceso: Configuración del proyecto → Propiedades del script → PIN
 */

const SPREADSHEET_ID = '';   // vacío = hoja a la que está vinculado el script
const FOLDER_ID = '';        // vacío = crea/usa la carpeta FOLDER_NAME
const FOLDER_NAME = 'Extra beställningar (PDF)';
const SHEET_NAME = 'Beställningar';
const TZ = 'Europe/Stockholm';

const HEADERS = [
  'Registrado', 'ID', 'Namn', 'HSA-ID', 'Telefon', 'E-post', 'Avdelning',
  'Kostnadsställe', 'Rumsnummer', 'Karmnummer', 'Beställning',
  'Underskriven av', 'Datum', 'Tid', 'PDF'
];

/** Abrir la URL /exec en el navegador debe mostrar {"ok":true,...}: sirve para comprobar el despliegue. */
function doGet() {
  return json_({ ok: true, service: 'extra-bestallning' });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const pin = PropertiesService.getScriptProperties().getProperty('PIN');
    if (!pin) return json_({ ok: false, error: 'El servidor no tiene PIN configurado.' });
    if (String(payload.pin || '') !== pin) return json_({ ok: false, error: 'Código de acceso incorrecto.' });
    return json_(guardarPedido_(payload));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function guardarPedido_(payload) {
  const f = payload.fields || {};
  const required = ['namn', 'hsa', 'telefon', 'epost', 'avdelning', 'rumsnummer', 'bestallning', 'datum', 'tid'];
  required.forEach(function (k) {
    if (!f[k] || String(f[k]).trim() === '') throw new Error('Falta el campo: ' + k);
  });
  if (!payload.pdfBase64) throw new Error('Falta el PDF.');
  if (payload.pdfBase64.length > 8 * 1024 * 1024) throw new Error('El PDF es demasiado grande.');

  const fileName = String(payload.fileName || 'Extra_bestallning.pdf').replace(/[^\w.\-]+/g, '_');
  const blob = Utilities.newBlob(Utilities.base64Decode(payload.pdfBase64), 'application/pdf', fileName);

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const file = getFolder_().createFile(blob);
    const id = Utilities.getUuid().slice(0, 8);
    getSheet_().appendRow([
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'),
      id,
      safe_(f.namn), safe_(f.hsa), safe_(f.telefon), safe_(f.epost), safe_(f.avdelning),
      safe_(f.kostnadsstalle), safe_(f.rumsnummer), safe_(f.karmnummer), safe_(f.bestallning),
      safe_(f.ansvarig), safe_(f.datum), safe_(f.tid),
      file.getUrl()
    ]);
    return { ok: true, id: id, url: file.getUrl() };
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getFolder_() {
  if (FOLDER_ID) return DriveApp.getFolderById(FOLDER_ID);
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function getSheet_() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

/** Evita que un texto que empiece por = + - @ se interprete como fórmula. */
function safe_(v) {
  const s = String(v == null ? '' : v).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
