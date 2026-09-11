// Exercices tirés de l'atelier « L'accord des participes passés »
// (Lycée St-Jacques, Français 3ème — L. Merenne), pages 5 à 14.
//
// Chaque exercice = un item auto-corrigé.
//   section : titre de la série (affiché en petit au-dessus)
//   verb    : l'infinitif à mettre au participe passé
//   context : phrase-modèle facultative (série « transformation »)
//   before / after : le texte de la phrase autour du trou
//   answers : réponses acceptées (les accents sont ignorés à la correction)
//   reminder: la règle rappelée quand l'élève valide (message court)

export const exercises = [
  // ---------------------------------------------------------------------------
  // SÉRIE 1 — Rappel : la forme du participe passé (masculin singulier)
  // ---------------------------------------------------------------------------
  {
    id: 1,
    section: 'Rappel — la forme du participe passé',
    verb: 'prendre',
    before: 'Le participe passé de « prendre » est : ',
    after: '.',
    answers: ['pris'],
    reminder: 'Verbe en -RE, mais irrégulier : le participe passé est en -is (prendre → pris, comme mettre → mis, apprendre → appris).',
  },
  {
    id: 2,
    section: 'Rappel — la forme du participe passé',
    verb: 'découvrir',
    before: 'Le participe passé de « découvrir » est : ',
    after: '.',
    answers: ['découvert'],
    reminder: 'Les verbes en -vrir et -ffrir font leur participe passé en -ert : couvrir → couvert, offrir → offert, découvrir → découvert.',
  },
  {
    id: 3,
    section: 'Rappel — la forme du participe passé',
    verb: 'mourir',
    before: 'Le participe passé de « mourir » est : ',
    after: '.',
    answers: ['mort'],
    reminder: 'Un verbe en -IR fait normalement son participe passé en -i, mais « mourir » est une exception : mort (en -t).',
  },
  {
    id: 4,
    section: 'Rappel — la forme du participe passé',
    verb: 'produire',
    before: 'Le participe passé de « produire » est : ',
    after: '.',
    answers: ['produit'],
    reminder: 'Les verbes en -uire font leur participe passé en -uit : conduire → conduit, cuire → cuit, produire → produit.',
  },
  {
    id: 5,
    section: 'Rappel — la forme du participe passé',
    verb: 'inclure',
    before: 'Le participe passé de « inclure » est : ',
    after: '.',
    answers: ['inclus'],
    reminder: 'Verbe en -RE irrégulier : « inclure » fait son participe passé en -us. Attention, « conclure » fait « conclu » (sans s) !',
  },
  {
    id: 6,
    section: 'Rappel — la forme du participe passé',
    verb: 'mettre',
    before: 'Le participe passé de « mettre » est : ',
    after: '.',
    answers: ['mis'],
    reminder: 'Verbe en -RE irrégulier : « mettre » fait son participe passé en -is, comme prendre → pris et soumettre → soumis.',
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 2 — Le participe passé employé SEUL (accord avec le nom)
  // ---------------------------------------------------------------------------
  {
    id: 7,
    section: 'Le participe passé employé seul',
    verb: 'parcourir',
    before: 'Seule, elle se rappelait ces étroits chemins tant de fois ',
    after: '.',
    answers: ['parcourus'],
    reminder: 'Employé seul, le participe passé s’accorde comme un adjectif : ici avec « chemins » (masc. pluriel).',
  },
  {
    id: 8,
    section: 'Le participe passé employé seul',
    verb: 'disparaître',
    before: '',
    after: ' depuis ce matin, notre chienne est rentrée tout à l’heure.',
    answers: ['disparue'],
    reminder: 'Participe passé seul → accord avec le nom : « chienne » est féminin singulier.',
  },
  {
    id: 9,
    section: 'Le participe passé employé seul',
    verb: 'porter',
    before: 'Le bruit de la forêt, ',
    after: ' par un vent léger, parvenait jusqu’à nous.',
    answers: ['porté'],
    reminder: 'On accorde avec le noyau du groupe : « le bruit » (masc. sing.), pas avec « forêt ».',
  },
  {
    id: 10,
    section: 'Le participe passé employé seul',
    verb: 'interroger',
    before: 'Les témoins ',
    after: ' n’ont pu répondre.',
    answers: ['interrogés'],
    reminder: 'Participe passé seul → accord avec « les témoins » (masc. pluriel).',
  },
  {
    id: 11,
    section: 'Le participe passé employé seul',
    verb: 'casser',
    before: 'Sa jambe et son bras ',
    after: ' l’obligent à rester chez lui.',
    answers: ['cassés'],
    reminder: 'Deux noms dont un masculin (« jambe » + « bras ») → accord au masculin pluriel.',
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 3 — Le participe passé avec l'auxiliaire ÊTRE (accord avec le sujet)
  // ---------------------------------------------------------------------------
  {
    id: 12,
    section: 'Le participe passé avec ÊTRE',
    verb: 'fermer',
    before: 'La porte n’est pas ',
    after: ' à clé.',
    answers: ['fermée'],
    reminder: 'Avec être, le participe passé s’accorde avec le sujet : « la porte » (fém. sing.).',
  },
  {
    id: 13,
    section: 'Le participe passé avec ÊTRE',
    verb: 'accueillir',
    before: 'Ses parents avaient été ',
    after: ' très chaleureusement.',
    answers: ['accueillis'],
    reminder: 'Avec être, accord avec le sujet « ses parents » (masc. pluriel).',
  },
  {
    id: 14,
    section: 'Le participe passé avec ÊTRE',
    verb: 'régler',
    before: 'Les affaires de ton oncle furent ',
    after: ' dès mon retour.',
    answers: ['réglées'],
    reminder: 'Avec être, accord avec le sujet « les affaires » (fém. pluriel).',
  },
  {
    id: 15,
    section: 'Le participe passé avec ÊTRE',
    verb: 'arriver',
    before: 'As-tu vu ma grand-mère lorsqu’elle est ',
    after: ' ?',
    answers: ['arrivée'],
    reminder: 'Avec être, accord avec le sujet « elle » (fém. sing.).',
  },
  {
    id: 16,
    section: 'Le participe passé avec ÊTRE',
    verb: 'sortir',
    before: 'Tous les chiens sont ',
    after: ' de l’enclos.',
    answers: ['sortis'],
    reminder: 'Avec être, accord avec le sujet « tous les chiens » (masc. pluriel).',
  },
  {
    id: 17,
    section: 'Le participe passé avec ÊTRE',
    verb: 'terminer',
    before: 'Ils sortirent dès que la toilette des enfants fut ',
    after: '.',
    answers: ['terminée'],
    reminder: 'Avec être, accord avec le sujet « la toilette » (fém. sing.), pas avec « enfants ».',
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 4 — Le participe passé avec l'auxiliaire AVOIR
  // (accord avec le COD placé AVANT ; sinon invariable)
  // ---------------------------------------------------------------------------
  {
    id: 18,
    section: 'Le participe passé avec AVOIR',
    verb: 'louer',
    before: 'Avez-vous ',
    after: ' votre place ?',
    answers: ['loué'],
    reminder: 'Avec avoir : pas d’accord car le COD « votre place » est placé APRÈS le verbe.',
  },
  {
    id: 19,
    section: 'Le participe passé avec AVOIR',
    verb: 'étonner',
    before: 'Elle a ',
    after: ' ses parents.',
    answers: ['étonné'],
    reminder: 'Avec avoir : le COD « ses parents » est placé après → pas d’accord.',
  },
  {
    id: 20,
    section: 'Le participe passé avec AVOIR',
    verb: 'diriger',
    before: 'Les enfants que nous avons ',
    after: ' ont suivi nos conseils.',
    answers: ['dirigés'],
    reminder: 'Avec avoir : accord avec le COD placé AVANT. « que » = les enfants (masc. pluriel).',
  },
  {
    id: 21,
    section: 'Le participe passé avec AVOIR',
    verb: 'donner',
    before: 'Voici les outils qu’il m’a ',
    after: '.',
    answers: ['donnés'],
    reminder: 'Avec avoir : accord avec le COD placé avant. « qu’ » = les outils (masc. pluriel).',
  },
  {
    id: 22,
    section: 'Le participe passé avec AVOIR',
    verb: 'écrire',
    before: 'Voici les dernières lettres que Victor Hugo ait ',
    after: ' !',
    answers: ['écrites'],
    reminder: 'Avec avoir : accord avec le COD placé avant. « que » = les lettres (fém. pluriel).',
  },
  {
    id: 23,
    section: 'Le participe passé avec AVOIR',
    verb: 'corriger',
    before: 'Ce sont toutes les fautes de frappe qu’il a ',
    after: ' dans ce texte.',
    answers: ['corrigées'],
    reminder: 'Avec avoir : accord avec le COD placé avant. « qu’ » = les fautes (fém. pluriel).',
  },
  {
    id: 24,
    section: 'Le participe passé avec AVOIR',
    verb: 'offrir',
    before: 'As-tu ',
    after: ' un cadeau à ta sœur pour son anniversaire ?',
    answers: ['offert'],
    reminder: 'Avec avoir : le COD « un cadeau » est placé après → pas d’accord.',
  },
  {
    id: 25,
    section: 'Le participe passé avec AVOIR',
    verb: 'penser',
    before: 'Y as-tu ',
    after: ' ?',
    answers: ['pensé'],
    reminder: '« penser à » n’a pas de COD (complément indirect) → jamais d’accord.',
  },
  {
    id: 26,
    section: 'Le participe passé avec AVOIR',
    verb: 'trouver',
    context: 'La solution ? Mais il ne l’a pas ...',
    before: 'La solution ? Mais il ne l’a pas ',
    after: '.',
    answers: ['trouvée'],
    reminder: 'Avec avoir : « l’ » (= la solution) est un COD placé avant → accord au féminin singulier.',
  },
  {
    id: 27,
    section: 'Le participe passé avec AVOIR',
    verb: 'envoyer',
    before: 'Lui as-tu envoyé des roses ? Oui, je lui en ai ',
    after: '.',
    answers: ['envoyé'],
    reminder: 'Avec avoir : jamais d’accord avec le pronom « en ».',
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 5 — Transformation : verbe + nom  →  nom + participe passé accordé
  // Modèle : livrer le charbon → le charbon livré
  // ---------------------------------------------------------------------------
  {
    id: 28,
    section: 'Transformation (participe passé adjectif)',
    verb: 'saisir',
    context: 'saisir le papillon  →  le papillon ...',
    before: 'le papillon ',
    after: '',
    answers: ['saisi'],
    reminder: 'Le participe passé employé comme adjectif s’accorde avec « le papillon » (masc. sing.).',
  },
  {
    id: 29,
    section: 'Transformation (participe passé adjectif)',
    verb: 'choisir',
    context: 'choisir la cravate  →  la cravate ...',
    before: 'la cravate ',
    after: '',
    answers: ['choisie'],
    reminder: 'Participe passé adjectif → accord avec « la cravate » (fém. sing.).',
  },
  {
    id: 30,
    section: 'Transformation (participe passé adjectif)',
    verb: 'remettre',
    context: 'remettre une lettre  →  une lettre ...',
    before: 'une lettre ',
    after: '',
    answers: ['remise'],
    reminder: 'Participe passé adjectif → accord avec « une lettre » (fém. sing.). remettre → remis / remise.',
  },
  {
    id: 31,
    section: 'Transformation (participe passé adjectif)',
    verb: 'peindre',
    context: 'peindre l’étagère  →  l’étagère ...',
    before: 'l’étagère ',
    after: '',
    answers: ['peinte'],
    reminder: 'Participe passé adjectif → accord avec « l’étagère » (fém. sing.). peindre → peint / peinte.',
  },
  {
    id: 32,
    section: 'Transformation (participe passé adjectif)',
    verb: 'atteindre',
    context: 'atteindre le sommet  →  le sommet ...',
    before: 'le sommet ',
    after: '',
    answers: ['atteint'],
    reminder: 'Participe passé adjectif → accord avec « le sommet » (masc. sing.). atteindre → atteint.',
  },
]
