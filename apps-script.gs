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
 * Deux onglets alimentés automatiquement :
 *   - « Résultats » : Horodatage · Élève · Set · Score · Réussite (%) · Niveau.
 *   - « Réactions » : Horodatage · Élève · Exercice · Réaction (J'aime / pas aimé).
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = {};
    }

    if (data.type === 'reaction') {
      var rsheet = ss.getSheetByName('Réactions') || ss.insertSheet('Réactions');
      if (rsheet.getLastRow() === 0) {
        rsheet.appendRow(['Horodatage', 'Élève', 'Exercice', 'Réaction']);
      }
      rsheet.appendRow([
        new Date(),
        data.name || '',
        data.link || '',
        data.reaction || '',
      ]);
      return ContentService.createTextOutput('ok');
    }

    var sheet = ss.getSheetByName('Résultats') || ss.getSheets()[0];
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
