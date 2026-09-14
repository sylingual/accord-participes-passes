/**
 * Google Apps Script — reçoit les résultats de l'atelier et les ajoute
 * dans le Google Sheet, une ligne par set terminé.
 *
 * MISE EN PLACE (une seule fois) :
 *   1. Ouvre ton Google Sheet.
 *   2. Menu « Extensions » → « Apps Script ».
 *   3. Efface le code existant et colle TOUT ce fichier.
 *   4. Clique « Déployer » → « Nouveau déploiement ».
 *        - Type : Application web
 *        - Exécuter en tant que : Moi
 *        - Qui a accès : Tout le monde
 *   5. Autorise l'accès si demandé, puis copie l'URL (…/exec).
 *   6. Colle cette URL dans src/statsConfig.js (champ sheetsUrl).
 *
 * Chaque ligne : Horodatage · Élève · Set · Score · Réussite (%) · Niveau.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Résultats') || ss.getSheets()[0];

    // En-têtes si la feuille est vide.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Horodatage',
        'Élève',
        'Set',
        'Score',
        'Réussite (%)',
        'Niveau',
      ]);
    }

    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = {};
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.set || '',
      data.score || '',
      data.percent != null ? data.percent + '%' : '',
      data.grade || '',
    ]);

    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Permet un test rapide en ouvrant l'URL dans le navigateur.
function doGet() {
  return ContentService.createTextOutput('Atelier participes passés : endpoint actif.');
}
