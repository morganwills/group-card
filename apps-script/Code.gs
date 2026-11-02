/**
 * Backend for the group card.
 *
 * Lives inside the Google Sheet that holds the messages
 * (Extensions > Apps Script). Two jobs:
 *
 *   doPost  — a visitor sends their message, it becomes a new row
 *   doGet   — the board asks for every message that is not hidden
 *
 * The Sheet itself stays private. Nobody sees it but you.
 */

var SHEET_NAME = 'Messages';
var HEADERS = ['Timestamp', 'Name', 'Message', 'Photo URL', 'Status'];

var MAX_NAME = 80;
var MAX_MESSAGE = 4000;

/**
 * Optional. Run this once from the editor to create the Messages tab up
 * front — the first message creates it anyway if you skip it.
 *
 * No getUi().alert() in here on purpose. That dialog opens in the
 * spreadsheet's own tab rather than the script editor, so running this
 * from the editor would sit on "running" forever, waiting for a click on
 * a box you cannot see. The execution log says it is done instead.
 */
function setup() {
  var sheet = getSheet();
  Logger.log('Ready. The "' + sheet.getName() + '" tab is set up. ' +
    'To hide a message later, type the word hidden in its Status column.');
}

function doGet() {
  try {
    var sheet = getSheet();
    var values = sheet.getDataRange().getValues();
    values.shift(); // drop the header row

    var messages = values
      .map(function (row) {
        return {
          at: row[0] ? new Date(row[0]).toISOString() : null,
          name: String(row[1] || '').trim(),
          message: String(row[2] || '').trim(),
          photo: String(row[3] || '').trim(),
          status: String(row[4] || '').trim().toLowerCase(),
        };
      })
      .filter(function (m) {
        return m.status !== 'hidden' && (m.message || m.photo) && m.name;
      })
      .map(function (m) {
        delete m.status;
        return m;
      });

    return json({ ok: true, messages: messages });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    // The page sends plain text rather than JSON on purpose: it keeps the
    // request simple enough that the browser skips its CORS preflight,
    // which Apps Script cannot answer.
    var body = JSON.parse(e.postData.contents);

    var name = String(body.name || '').trim().slice(0, MAX_NAME);
    var message = String(body.message || '').trim().slice(0, MAX_MESSAGE);
    var photo = String(body.photo || '').trim();

    if (!name) return json({ ok: false, error: 'Please add your name.' });
    if (!message && !photo) return json({ ok: false, error: 'Please add a message or a photo.' });
    if (photo && photo.indexOf('https://') !== 0) {
      return json({ ok: false, error: 'That photo could not be saved.' });
    }

    // One writer at a time, so two people pressing Send together
    // cannot land on the same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      getSheet().appendRow([new Date(), name, message, photo, 'visible']);
    } finally {
      lock.releaseLock();
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'Something went wrong saving that. Please try again.' });
  }
}

/** Hands back the Messages tab, creating it with its headers if needed. */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('This script has to live inside the Sheet — open it with Extensions > Apps Script.');
  }

  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(3, 480);
  }

  return sheet;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
