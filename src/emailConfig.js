// ┌──────────────────────────────────────────────────────────────────────────┐
// │  CONFIGURATION DE L'ENVOI DES RÉSULTATS PAR E-MAIL (EmailJS)               │
// │                                                                            │
// │  Pour recevoir automatiquement le nom + le score de chaque élève dans      │
// │  votre boîte mail, créez un compte GRATUIT sur https://www.emailjs.com     │
// │  puis remplacez les 3 valeurs ci-dessous. (Voir le README, étape par       │
// │  étape.) Tant que ce n'est pas configuré, l'élève pourra quand même        │
// │  TÉLÉCHARGER ses résultats — rien n'est perdu.                             │
// └──────────────────────────────────────────────────────────────────────────┘

export const emailConfig = {
  // 1) EmailJS → Account → General → "Public Key"
  publicKey: 'VOTRE_PUBLIC_KEY',

  // 2) EmailJS → Email Services → l'ID du service (ex. "service_xxxxxxx")
  serviceId: 'VOTRE_SERVICE_ID',

  // 3) EmailJS → Email Templates → l'ID du modèle (ex. "template_xxxxxxx")
  templateId: 'VOTRE_TEMPLATE_ID',
}

// L'adresse du professeur (le destinataire) se règle directement dans le
// modèle EmailJS, champ « To Email ». Elle n'a donc pas besoin d'apparaître ici.

// Variables envoyées au modèle EmailJS (à utiliser avec {{...}} dans le modèle) :
//   {{student_name}}  — le prénom saisi par l'élève
//   {{score}}         — ex. "7 / 10"
//   {{correct}}       — nombre de bonnes réponses
//   {{answered}}      — nombre d'exercices faits
//   {{total}}         — nombre total d'exercices de l'atelier
//   {{percent}}       — pourcentage de réussite
//   {{outcome}}       — "Atelier terminé" ou "Arrêt anticipé"
//   {{date}}          — date et heure de l'envoi
//   {{details}}       — le détail question par question (texte)

export function isEmailConfigured() {
  return (
    emailConfig.publicKey &&
    !emailConfig.publicKey.startsWith('VOTRE_') &&
    emailConfig.serviceId &&
    !emailConfig.serviceId.startsWith('VOTRE_') &&
    emailConfig.templateId &&
    !emailConfig.templateId.startsWith('VOTRE_')
  )
}
