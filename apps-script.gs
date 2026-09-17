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
 * Onglet « Codes » — colonnes : Code personnel | Prénom | Nom | Groupe
 *   Tu peux le pré-remplir, OU le laisser se remplir tout seul : à la 1re
 *   utilisation d'un code, l'élève saisit son prénom/nom/groupe et le script les
 *   inscrit ici. Ensuite, son profil est retrouvé automatiquement (même sur un
 *   autre appareil). Crée quand même l'onglet « Codes » (il sera créé au besoin).
 *
 * Onglets alimentés automatiquement :
 *   - « Résultats » : Horodatage · Code personnel · Prénom · Nom · Groupe · Set ·
 *       Score · Réussite (%) · Niveau  (Prénom/Nom/Groupe repris de l'onglet Codes).
 *   - « Réactions » : Exercice · 👍 J'aime · 👎 J'ai pas aimé  (COMPTEUR GLOBAL,
 *     sans nom d'élève — chaque exercice a sa ligne, les compteurs s'incrémentent).
 */
// Retrouve prénom / nom / groupe à partir du code, dans l'onglet « Codes ».
function lookupCode(ss, code) {
  var sh = ss.getSheetByName('Codes');
  if (!sh || sh.getLastRow() < 2) return { prenom: '', nom: '', groupe: '' };
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  var target = String(code).trim().toUpperCase();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toUpperCase() === target) {
      return { prenom: vals[i][1] || '', nom: vals[i][2] || '', groupe: vals[i][3] || '' };
    }
  }
  return { prenom: '', nom: '', groupe: '' };
}
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
        rsheet.appendRow(['Exercice', "👍 J'aime", "👎 J'ai pas aimé"]);
      }
      var key = data.title || data.url || '';
      // Cherche la ligne de cet exercice (sinon on la crée).
      var col = rsheet.getRange(1, 1, rsheet.getLastRow(), 1).getValues();
      var row = -1;
      for (var i = 1; i < col.length; i++) {
        if (col[i][0] === key) {
          row = i + 1;
          break;
        }
      }
      if (row === -1) {
        rsheet.appendRow([key, 0, 0]);
        row = rsheet.getLastRow();
      }
      var up = Number(rsheet.getRange(row, 2).getValue()) || 0;
      var down = Number(rsheet.getRange(row, 3).getValue()) || 0;
      up = Math.max(0, up + (Number(data.up) || 0));
      down = Math.max(0, down + (Number(data.down) || 0));
      rsheet.getRange(row, 2).setValue(up);
      rsheet.getRange(row, 3).setValue(down);
      return ContentService.createTextOutput('ok');
    }

    // Inscription (1re utilisation d'un code) : on remplit l'onglet « Codes ».
    if (data.type === 'register') {
      var cs = ss.getSheetByName('Codes') || ss.insertSheet('Codes');
      if (cs.getLastRow() === 0) {
        cs.appendRow(['Code personnel', 'Prénom', 'Nom', 'Groupe']);
      }
      var rcode = String(data.code || '').trim();
      var crows = cs.getLastRow() > 1 ? cs.getRange(2, 1, cs.getLastRow() - 1, 4).getValues() : [];
      var crow = -1;
      for (var j = 0; j < crows.length; j++) {
        if (String(crows[j][0]).trim().toUpperCase() === rcode.toUpperCase()) {
          crow = j + 2;
          break;
        }
      }
      if (crow === -1) {
        cs.appendRow([rcode, data.prenom || '', data.nom || '', data.groupe || '']);
      } else {
        // ne remplit que les cellules vides (préserve tes saisies manuelles)
        if (!String(cs.getRange(crow, 2).getValue()).trim()) cs.getRange(crow, 2).setValue(data.prenom || '');
        if (!String(cs.getRange(crow, 3).getValue()).trim()) cs.getRange(crow, 3).setValue(data.nom || '');
        if (!String(cs.getRange(crow, 4).getValue()).trim()) cs.getRange(crow, 4).setValue(data.groupe || '');
      }
      return ContentService.createTextOutput('ok');
    }

    var sheet = ss.getSheetByName('Résultats') || ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Horodatage',
        'Code personnel',
        'Prénom',
        'Nom',
        'Groupe',
        'Set',
        'Score',
        'Réussite (%)',
        'Niveau',
      ]);
    }

    var code = data.code || '';
    var prenom = data.prenom || data.name || ''; // prénom envoyé (ou ancien mode)
    var nom = data.nom || '';
    var groupe = data.groupe || data.group || '';
    // Secours : si rien n'est envoyé, on cherche dans l'onglet « Codes ».
    if (code && !prenom && !nom) {
      var info = lookupCode(ss, code);
      prenom = info.prenom;
      nom = info.nom;
      if (info.groupe) groupe = info.groupe;
    }

    sheet.appendRow([
      new Date(),
      code,
      prenom,
      nom,
      groupe,
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

// Lecture du profil d'un code (JSONP) : ...?code=XXX&callback=cb
// Renvoie cb({found, prenom, nom, groupe}). Sans code : message de test.
function doGet(e) {
  var out = { ok: true };
  if (e && e.parameter && e.parameter.code) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var info = lookupCode(ss, e.parameter.code);
    out = {
      found: !!(info.prenom || info.nom),
      prenom: info.prenom,
      nom: info.nom,
      groupe: info.groupe,
    };
  }
  var json = JSON.stringify(out);
  if (e && e.parameter && e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
