// ┌──────────────────────────────────────────────────────────────────────────┐
// │  ENVOI DES STATISTIQUES DANS UN GOOGLE SHEET (sans e-mail)                 │
// │                                                                            │
// │  À chaque set terminé, l'app ajoute une ligne dans TON Google Sheet :      │
// │  Horodatage · Élève · Set · Score · Réussite (%) · Niveau.                 │
// │                                                                            │
// │  Mise en place (une seule fois, ~5 min) — voir le README, section          │
// │  « Suivi des résultats (Google Sheet) » :                                  │
// │    1. Crée un Google Sheet.                                                 │
// │    2. Extensions → Apps Script, colle le contenu de `apps-script.gs`.       │
// │    3. Déployer → Nouveau déploiement → Application web                      │
// │         · Exécuter en tant que : Moi                                        │
// │         · Qui a accès : Tout le monde                                       │
// │    4. Copie l'URL du déploiement (…/exec) et colle-la ci-dessous.          │
// │                                                                            │
// │  Tant que ce n'est pas configuré, l'app fonctionne normalement mais        │
// │  n'enregistre rien.                                                        │
// └──────────────────────────────────────────────────────────────────────────┘

export const statsConfig = {
  // Colle ici l'URL de ton application web Apps Script (se termine par /exec)
  sheetsUrl: 'VOTRE_URL_APPS_SCRIPT',
}

export function isStatsConfigured() {
  return (
    !!statsConfig.sheetsUrl && !statsConfig.sheetsUrl.startsWith('VOTRE_')
  )
}
