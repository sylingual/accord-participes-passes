// Contenu des 5 sets de l'atelier, organisés selon les « 4 checks » du passé
// composé (+ un set bonus de liens).
//
// Un SET = { id, num, icon, title, subtitle, kind, ... }
//   kind 'links'     : intro + liste de liens externes (cases à cocher, non noté)
//   kind 'exercises' : cards[] (noté, avec grade). `paced:true` = une carte à la fois.
//
// Une CARD peut être :
//   { kind:'verbs',     items:[{verb, verbEn, answers, rule, ruleEn, example, exampleEn}] }
//   { kind:'sentence',  before, after, answers, allowEmpty, hint, rule, ruleEn, example, exampleEn }
//   { kind:'segmented', instruction, tip, tipEn, segments:[ 'texte' | {t:'select'|'text', o?, a, hint?} ] }

const AUX = { t: 'select', o: ['est', 'a'], a: 'est' }
const sel = (o, a) => ({ t: 'select', o, a })
const txt = (a, hint) => ({ t: 'text', a, hint })

const AUX_TIP =
  'Rappel : les verbes de mouvement (naître, mourir, aller, venir, monter, descendre, entrer, sortir, arriver, partir, rester, passer, tomber, retourner) et TOUS les verbes pronominaux (se…) se conjuguent avec ÊTRE. Les autres verbes utilisent AVOIR.'
const AUX_TIP_EN =
  'Reminder: verbs of movement (naître, mourir, aller, venir, monter, descendre, entrer, sortir, arriver, partir, rester, passer, tomber, retourner) and ALL reflexive verbs (se…) use ÊTRE. All other verbs use AVOIR.'

// --- SET 2 — Le bon auxiliaire -------------------------------------------------
const check2Cards = [
  // Exo 1 : choisir l'auxiliaire (tout est ÊTRE)
  {
    kind: 'segmented',
    instruction:
      'Exercice 1 : Choisis l’auxiliaire conjugué (est ou a) pour chaque verbe.',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Jean ', AUX, ' né en 1930. Il ', AUX, ' mort en 2011. En 2001, il ', AUX,
      ' passé nous voir à la montagne. Il ', AUX, ' venu de Paris, il ', AUX,
      ' arrivé, il ', AUX, ' monté, il ', AUX, ' entré, il ', AUX, ' resté, il ',
      AUX, ' sorti, il ', AUX, ' descendu, il ', AUX, ' tombé, il ', AUX,
      ' parti, il ', AUX, ' allé à Lyon et il ', AUX, ' retourné à Paris.',
    ],
  },
  // Exo 2 : l'histoire de Camila, une ligne à la fois
  {
    kind: 'segmented',
    instruction: 'Exercice 2 : L’histoire de Camila. Choisis le bon auxiliaire.',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Camila ', sel(['a', 'est'], 'est'), ' venue chez moi. Mais elle ',
      sel(['a', 'est'], 'est'), ' arrivée en retard, alors j’étais fâché, mais je ',
      sel(['n’ai', 'ne suis'], 'n’ai'), ' rien dit.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      sel(['J’ai', 'Je suis'], 'J’ai'),
      ' cuisiné un bon gâteau pour elle. Ensuite, on ', sel(['a', 'est'], 'a'),
      ' mangé de la glace à la pistache.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'On ', sel(['a', 'est'], 'a'), ' regardé un film, puis elle ',
      sel(['m’a', 'm’est'], 'm’a'), ' rappelé qu’on devait étudier. Elle ',
      sel(['est', 'a'], 'est'),
      ' donc partie plus tôt, avant que je puisse lui dire mes sentiments.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'J’étais triste, ', sel(['je me suis', 'j’ai me'], 'je me suis'),
      ' senti minable. ',
      sel(['Je n’ai pas été', 'Je ne suis pas été'], 'Je n’ai pas été'),
      ' courageux.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Le lendemain, ', sel(['j’ai', 'je suis'], 'j’ai'),
      ' vu Camila à la station de bus. Quand elle ', sel(['a', 'est'], 'est'),
      ' montée dans le bus, je lui ', sel(['ai', 'suis'], 'ai'),
      ' dit bonjour. Mais elle ', sel(['n’a', 'n’est'], 'n’a'), ' pas répondu.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Plus tard, on ', sel(['est', 'a'], 'est'), ' descendu du bus. ',
      sel(['J’ai', 'Je suis'], 'J’ai'),
      ' aperçu Camila en train de parler avec un autre garçon. ',
      sel(['Je me suis', 'J’ai me'], 'Je me suis'), ' approché du garçon et je ',
      sel(['l’ai', 'le suis'], 'l’ai'), ' poussé.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Le garçon ', sel(['a', 'est'], 'est'), ' tombé et ',
      sel(['s’est', 'a'], 's’est'), ' fait mal. Il ', sel(['n’est', 'n’a'], 'n’est'),
      ' pas mort, mais il ', sel(['a', 'est'], 'a'),
      ' dû aller à l’hôpital car il ', sel(['s’est', 'a'], 's’est'),
      ' cassé sa jambe.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'J’étais vraiment stupide. ', sel(['J’ai', 'Je suis'], 'J’ai'),
      ' demandé pardon, mais Camila ', sel(['ne m’a', 'ne m’est'], 'ne m’a'),
      ' pas pardonné.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Pour me faire pardonner, ', sel(['j’ai', 'je suis'], 'j’ai'),
      ' visité le garçon à l’hôpital. Je lui ', sel(['ai', 'suis'], 'ai'),
      ' apporté des chocolats. Mais il ', sel(['a', 'est'], 'a'),
      ' jeté les chocolats. Il était fâché contre moi.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      sel(['Je suis', 'J’ai'], 'Je suis'),
      ' revenu le lendemain, avec d’autres chocolats. Il ', sel(['a', 'est'], 'a'),
      ' craché dessus.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Mais ', sel(['j’ai', 'je suis'], 'j’ai'),
      ' continué à venir, tous les jours. Je lui apportais les devoirs et je lui racontais les nouvelles de la classe.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Un jour, il ', sel(['a', 'est'], 'a'), ' reçu des béquilles. Il ',
      sel(['a', 'est'], 'a'), ' failli tomber la première fois, mais je ',
      sel(['l’ai', 'l’suis'], 'l’ai'), ' rattrapé. Il ', sel(['a', 'est'], 'a'),
      ' dit « Merci », gêné.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Quand il ', sel(['est', 'a'], 'est'), ' revenu à l’école, je ',
      sel(['l’ai', 'le suis'], 'l’ai'), ' aidé en lui ouvrant les portes.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (suite)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      'Quelques mois plus tard, il marchait normalement à nouveau, et il ',
      sel(['m’a', 'm’est'], 'm’a'), ' invité à son anniversaire. Je lui ',
      sel(['ai', 'suis'], 'ai'), ' apporté un cadeau. Il ', sel(['a', 'est'], 'a'),
      ' bien aimé.',
    ],
  },
  {
    kind: 'segmented',
    instruction: 'Exercice 2 (fin)',
    tip: AUX_TIP,
    tipEn: AUX_TIP_EN,
    segments: [
      sel(['Je n’ai', 'Je ne suis'], 'Je n’ai'),
      ' plus jamais poussé quelqu’un de ma vie après !',
    ],
  },
]

// --- SET 3 — Le bon participe passé -------------------------------------------
const check3Verbs = [
  { verb: 'parler', verbEn: 'to speak', answers: ['parlé'], rule: 'Verbe en -ER → participe passé en -É.', ruleEn: 'An -ER verb → past participle in -É.', example: 'Nous avons **parlé** pendant des heures.', exampleEn: 'We **talked** for hours.' },
  { verb: 'manger', verbEn: 'to eat', answers: ['mangé'], rule: 'Verbe en -ER → participe passé en -É.', ruleEn: 'An -ER verb → past participle in -É.', example: 'On a **mangé** de la glace à la pistache.', exampleEn: 'We **ate** pistachio ice cream.' },
  { verb: 'finir', verbEn: 'to finish', answers: ['fini'], rule: 'Verbe en -IR → participe passé en -I.', ruleEn: 'An -IR verb → past participle in -I.', example: 'J’ai **fini** mes devoirs avant le dîner.', exampleEn: 'I **finished** my homework before dinner.' },
  { verb: 'choisir', verbEn: 'to choose', answers: ['choisi'], rule: 'Verbe en -IR → participe passé en -I.', ruleEn: 'An -IR verb → past participle in -I.', example: 'Elle a **choisi** la plus belle rose.', exampleEn: 'She **chose** the most beautiful rose.' },
  { verb: 'vendre', verbEn: 'to sell', answers: ['vendu'], rule: 'Verbe en -RE → participe passé en -U.', ruleEn: 'An -RE verb → past participle in -U.', example: 'Ils ont **vendu** leur vieille voiture.', exampleEn: 'They **sold** their old car.' },
  { verb: 'attendre', verbEn: 'to wait', answers: ['attendu'], rule: 'Verbe en -RE → participe passé en -U.', ruleEn: 'An -RE verb → past participle in -U.', example: 'Nous avons **attendu** le bus sous la pluie.', exampleEn: 'We **waited** for the bus in the rain.' },
  { verb: 'prendre', verbEn: 'to take', answers: ['pris'], rule: 'Exception (-RE) : participe passé en -IS.', ruleEn: 'Exception (-RE): past participle in -IS.', example: 'J’ai **pris** ta main dans le noir.', exampleEn: 'I **took** your hand in the dark.' },
  { verb: 'mettre', verbEn: 'to put', answers: ['mis'], rule: 'Exception (-RE) : participe passé en -IS.', ruleEn: 'Exception (-RE): past participle in -IS.', example: 'Elle a **mis** son plus beau manteau.', exampleEn: 'She **put on** her nicest coat.' },
  { verb: 'ouvrir', verbEn: 'to open', answers: ['ouvert'], rule: 'Exception (-VRIR) : participe passé en -ERT.', ruleEn: 'Exception (-VRIR): past participle in -ERT.', example: 'Il a **ouvert** la fenêtre pour écouter la pluie.', exampleEn: 'He **opened** the window to listen to the rain.' },
  { verb: 'écrire', verbEn: 'to write', answers: ['écrit'], rule: 'Exception (-RE) : participe passé en -IT.', ruleEn: 'Exception (-RE): past participle in -IT.', example: 'Elle a **écrit** une lettre pleine d’amour.', exampleEn: 'She **wrote** a letter full of love.' },
  { verb: 'faire', verbEn: 'to do / to make', answers: ['fait'], rule: 'Exception : participe passé « fait » (-T).', ruleEn: 'Exception: past participle « fait » (-T).', example: 'Nous avons **fait** un gâteau au chocolat.', exampleEn: 'We **made** a chocolate cake.' },
  { verb: 'venir', verbEn: 'to come', answers: ['venu'], rule: 'Exception (-IR) : participe passé en -U (venir → venu).', ruleEn: 'Exception (-IR): past participle in -U (venir → venu).', example: 'Mes cousines sont **venues** passer l’été.', exampleEn: 'My cousins **came** to spend the summer.' },
  { verb: 'boire', verbEn: 'to drink', answers: ['bu'], rule: 'Exception (-RE) : participe passé en -U (boire → bu).', ruleEn: 'Exception (-RE): past participle in -U (boire → bu).', example: 'Le chat a **bu** tout le lait.', exampleEn: 'The cat **drank** all the milk.' },
  { verb: 'mourir', verbEn: 'to die', answers: ['mort'], rule: 'Exception (-IR) : participe passé « mort » (-T).', ruleEn: 'Exception (-IR): past participle « mort » (-T).', example: 'Le vieux chien est **mort** doucement.', exampleEn: 'The old dog **died** peacefully.' },
]

// --- SET 4 — L'accord du participe passé --------------------------------------
// L'élève tape la TERMINAISON à ajouter au participe (ou rien s'il n'y a pas d'accord).
const acc = (before, answer, after, rule, ruleEn, example, exampleEn) => ({
  kind: 'sentence',
  before,
  after,
  answers: [answer],
  allowEmpty: answer === '',
  hint: answer === '' ? 'rien' : `+ ${answer}`,
  rule,
  ruleEn,
  example,
  exampleEn,
})

const check4Cards = [
  acc('Les chocolats que j’ai acheté', 's', ' pour mon ami.',
    'Avec AVOIR, accord avec le COD placé avant : « que » = les chocolats (masc. pluriel) → +S.',
    'With AVOIR, agreement with the direct object placed before: « que » = the chocolates (masc. plural) → +S.',
    'Les gâteaux qu’il a **faits** étaient délicieux.', 'The cakes he **made** were delicious.'),
  acc('Les fleurs que j’ai acheté', 'es', ' pour Camila.',
    'Avec AVOIR, accord avec « que » = les fleurs (féminin pluriel) → +ES.',
    'With AVOIR, agreement with « que » = the flowers (feminine plural) → +ES.',
    'Les lettres qu’elle a **écrites** sont touchantes.', 'The letters she **wrote** are moving.'),
  acc('Le gâteau que j’ai cuisiné', '', ' pour Camila.',
    'Le COD « que » = le gâteau (masculin singulier) : le participe ne change pas → rien à ajouter.',
    'The direct object « que » = the cake (masculine singular): the participle does not change → nothing to add.',
    'Le film que nous avons **regardé** était drôle.', 'The film we **watched** was funny.'),
  acc('La glace que nous avons mangé', 'e', ' était à la pistache.',
    'Avec AVOIR, accord avec « que » = la glace (féminin singulier) → +E.',
    'With AVOIR, agreement with « que » = the ice cream (feminine singular) → +E.',
    'La chanson que tu as **chantée** m’a fait pleurer.', 'The song you **sang** made me cry.'),
  acc('Le film que nous avons regardé', '', ' ensemble.',
    'COD « que » = le film (masculin singulier) → pas de changement.',
    'Direct object « que » = the film (masculine singular) → no change.',
    'Le cadeau qu’il a **reçu** lui a plu.', 'The gift he **received** pleased him.'),
  acc('Les béquilles qu’il a reçu', 'es', ' à l’hôpital.',
    'Avec AVOIR, accord avec « que » = les béquilles (féminin pluriel) → +ES.',
    'With AVOIR, agreement with « que » = the crutches (feminine plural) → +ES.',
    'Les photos que j’ai **choisies** sont sur le mur.', 'The photos I **chose** are on the wall.'),
  acc('Camila est arrivé', 'e', ' en retard.',
    'Avec ÊTRE, accord avec le sujet « Camila » (féminin singulier) → +E.',
    'With ÊTRE, agreement with the subject « Camila » (feminine singular) → +E.',
    'Elle est **partie** avant la fin du film.', 'She **left** before the end of the film.'),
  acc('Le garçon est tombé', '', ' dans la cour.',
    'Avec ÊTRE, sujet « le garçon » (masculin singulier) → pas de changement.',
    'With ÊTRE, subject « the boy » (masculine singular) → no change.',
    'Il est **monté** dans le bus en courant.', 'He **got on** the bus running.'),
  acc('Ils se sont approché', 's', ' du garçon.',
    'Verbe pronominal sans COD après : accord avec le sujet « ils » (masculin pluriel) → +S.',
    'Reflexive verb with no direct object after it: agreement with the subject « they » (masc. plural) → +S.',
    'Elles se sont **réveillées** très tôt.', 'They **woke up** very early.'),
  acc('Elle s’est cassé', '', ' la jambe.',
    'Piège ! Le COD « la jambe » est placé APRÈS → pas d’accord (compare : « elle s’est cassée »).',
    'Trap! The direct object « la jambe » comes AFTER → no agreement (compare: « elle s’est cassée »).',
    'Elle s’est **lavé** les mains (COD après → pas d’accord).', 'She **washed** her hands (object after → no agreement).'),
]

// --- SET 1 — Passé composé ou imparfait ? (menus déroulants) -------------------
const TENSE_TIP =
  'Imparfait = habitude, description, action qui dure (avant, souvent, tous les jours, le lundi…). Passé composé = action précise, ponctuelle, terminée (hier, cette année, une fois…).'
const TENSE_TIP_EN =
  'Imperfect = habit, description, ongoing action (before, often, every day…). Passé composé = a precise, one-off, completed action (yesterday, once, that day…).'

// Chaque carte = une paire de phrases (même verbe, deux temps différents),
// avec une explication personnalisée (comme un prof de FLE).
const tcard = (tip, tipEn, segments) => ({
  kind: 'segmented',
  tip,
  tipEn,
  segments,
})

const check1Cards = [
  tcard(
    '« Avant » marque une habitude passée → imparfait (partaient). « Cette année » désigne un moment précis et unique → passé composé (sont partis).',
    '« Avant » signals a past habit → imperfect (partaient). « Cette année » is a specific, one-off moment → passé composé (sont partis).',
    [
      'Avant, ils ', sel(['sont partis', 'partaient'], 'partaient'),
      ' en vacances en août.\nCette année, ils ',
      sel(['sont partis', 'partaient'], 'sont partis'), ' en juin ?',
    ]
  ),
  tcard(
    '« Tous les soirs » = action répétée, habitude → imparfait (étudiait). « Jusqu’en mars dernier » = période terminée et délimitée → passé composé (a étudié).',
    '« Tous les soirs » = a repeated action, a habit → imperfect (étudiait). « Jusqu’en mars dernier » = a finished, bounded period → passé composé (a étudié).',
    [
      'Sophie ', sel(['a étudié', 'étudiait'], 'étudiait'),
      ' tous les soirs.\nElle ', sel(['a étudié', 'étudiait'], 'a étudié'),
      ' jusqu’en mars dernier.',
    ]
  ),
  tcard(
    '« Hier soir » = moment précis et terminé → passé composé (ai regardé). « Petit… souvent » = habitude de l’enfance → imparfait (regardais).',
    '« Hier soir » = a specific, finished moment → passé composé (ai regardé). « Petit… souvent » = a childhood habit → imperfect (regardais).',
    [
      'Hier soir, j’', sel(['ai regardé', 'regardais'], 'ai regardé'),
      ' un dessin animé.\nPetit, je ', sel(['ai regardé', 'regardais'], 'regardais'),
      ' souvent des dessins animés.',
    ]
  ),
  tcard(
    '« Jeudi » = un jour précis, une seule fois → passé composé (vous êtes rencontrés). « Le jeudi » = tous les jeudis, habitude → imparfait (vous rencontriez).',
    '« Jeudi » = one specific day, once → passé composé (vous êtes rencontrés). « Le jeudi » = every Thursday, a habit → imperfect (vous rencontriez).',
    [
      'Vous ', sel(['vous êtes rencontrés', 'vous rencontriez'], 'vous êtes rencontrés'),
      ' jeudi.\nVous ',
      sel(['vous êtes rencontrés', 'vous rencontriez'], 'vous rencontriez'),
      ' le jeudi.',
    ]
  ),
  tcard(
    '« Au moment où » = un événement ponctuel et précis → passé composé (sommes sortis, est tombé). « Chaque jour où » = répétition, habitude → imparfait (sortions, tombait).',
    '« Au moment où » = one precise event → passé composé (sommes sortis, est tombé). « Chaque jour où » = repetition, a habit → imperfect (sortions, tombait).',
    [
      'Au moment où nous ', sel(['sommes sortis', 'sortions'], 'sommes sortis'),
      ', il ', sel(['est tombé', 'tombait'], 'est tombé'),
      '.\nChaque jour où nous ', sel(['sommes sortis', 'sortions'], 'sortions'),
      ', il ', sel(['est tombé', 'tombait'], 'tombait'), '.',
    ]
  ),
  tcard(
    'Une date précise (« le 2 juin 2016 ») = fait unique → passé composé (avons déjeuné). « Tous les 2 juin » = habitude qui se répète → imparfait (déjeunions).',
    'A precise date (« le 2 juin 2016 ») = a unique fact → passé composé (avons déjeuné). « Tous les 2 juin » = a repeated habit → imperfect (déjeunions).',
    [
      'Le 2 juin 2016, nous ', sel(['avons déjeuné', 'déjeunions'], 'avons déjeuné'),
      ' à la terrasse du café de la Paix.\nTous les 2 juin, nous ',
      sel(['avons déjeuné', 'déjeunions'], 'déjeunions'),
      ' à la terrasse du café de la Paix.',
    ]
  ),
  tcard(
    '« Pendant la guerre » décrit une situation, un décor → imparfait (était). « De 1939 à 1945 » = période délimitée, avec un début et une fin → passé composé (a été).',
    '« Pendant la guerre » describes a situation/background → imperfect (était). « De 1939 à 1945 » = a bounded period with a start and an end → passé composé (a été).',
    [
      'Pendant la guerre, la vie ', sel(['a été', 'était'], 'était'),
      ' difficile.\nDe 1939 à 1945, la vie ', sel(['a été', 'était'], 'a été'),
      ' difficile.',
    ]
  ),
  tcard(
    '« Cet été » = un été précis, action ponctuelle → passé composé (avons repeint). « Tous les étés » = habitude → imparfait (repeignions).',
    '« Cet été » = one specific summer, a one-off action → passé composé (avons repeint). « Tous les étés » = a habit → imperfect (repeignions).',
    [
      'Cet été, nous ', sel(['avons repeint', 'repeignions'], 'avons repeint'),
      ' tous les volets de la maison.\nTous les étés, nous ',
      sel(['avons repeint', 'repeignions'], 'repeignions'),
      ' les volets de la maison.',
    ]
  ),
  tcard(
    '« Pendant leur enfance » décrit un état sur une longue durée → imparfait (avaient). « Une fois dans leur vie » = événement unique et ponctuel → passé composé (ont eu).',
    '« Pendant leur enfance » describes a lasting state → imperfect (avaient). « Une fois dans leur vie » = a unique, one-off event → passé composé (ont eu).',
    [
      'Pendant leur enfance, Nicolas et Pierre ', sel(['ont eu', 'avaient'], 'avaient'),
      ' les cheveux teints en rouge.\nUne fois dans leur vie, Nicolas et Pierre ',
      sel(['ont eu', 'avaient'], 'ont eu'), ' les cheveux teints en rouge.',
    ]
  ),
  tcard(
    '« Au moins vingt fois » = actions comptées et terminées → passé composé (ai lu). « Toujours » ici = habitude régulière → imparfait (lisais).',
    '« Au moins vingt fois » = counted, finished actions → passé composé (ai lu). « Toujours » here = a regular habit → imperfect (lisais).',
    [
      'J’', sel(['ai lu', 'lisais'], 'ai lu'),
      ' au moins vingt fois à mes enfants l’histoire du Petit Chaperon Rouge.\nJe ',
      sel(['ai lu', 'lisais'], 'lisais'),
      ' toujours à mes enfants l’histoire du Petit Chaperon Rouge.',
    ]
  ),
  tcard(
    '« La dernière fois » = un événement précis et unique → passé composé (est venu, a téléphoné). « Chaque fois » = répétition, habitude → imparfait (venait, téléphonait).',
    '« La dernière fois » = one specific, unique event → passé composé (est venu, a téléphoné). « Chaque fois » = repetition, a habit → imperfect (venait, téléphonait).',
    [
      'La dernière fois qu’il ', sel(['est venu', 'venait'], 'est venu'),
      ' à Nancy, il nous ', sel(['a téléphoné', 'téléphonait'], 'a téléphoné'),
      '.\nChaque fois qu’il ', sel(['est venu', 'venait'], 'venait'),
      ' à Nancy, il nous ', sel(['a téléphoné', 'téléphonait'], 'téléphonait'), '.',
    ]
  ),
  tcard(
    '« Pendant longtemps » = durée délimitée et terminée → passé composé (ai étudié). « Au lycée » décrit une période, une habitude → imparfait (étudiais).',
    '« Pendant longtemps » = a bounded, finished duration → passé composé (ai étudié). « Au lycée » describes a period, a habit → imperfect (étudiais).',
    [
      'J’', sel(['ai étudié', 'étudiais'], 'ai étudié'),
      ' le français pendant longtemps !\nAu lycée, j’',
      sel(['ai étudié', 'étudiais'], 'étudiais'), ' le français.',
    ]
  ),
  tcard(
    '« Depuis… » décrit une action en train de se dérouler, un arrière-plan → imparfait (roulions). Une durée bouclée et terminée (« … sans nous arrêter ») → passé composé (avons roulé).',
    '« Depuis… » describes an ongoing background action → imperfect (roulions). A completed, bounded duration (« … sans nous arrêter ») → passé composé (avons roulé).',
    [
      'Nous ', sel(['avons roulé', 'roulions'], 'roulions'),
      ' depuis plus de six heures.\nNous ', sel(['avons roulé', 'roulions'], 'avons roulé'),
      ' plus de six heures sans nous arrêter.',
    ]
  ),
  tcard(
    'Sans indice d’habitude, l’action est vue comme terminée → passé composé (ont fini). « Souvent » = habitude, répétition → imparfait (finissaient).',
    'With no habit marker, the action is seen as completed → passé composé (ont fini). « Souvent » = a habit, repetition → imperfect (finissaient).',
    [
      'Les étudiants ', sel(['ont fini', 'finissaient'], 'ont fini'),
      ' leurs exercices.\nSouvent, les étudiants ',
      sel(['ont fini', 'finissaient'], 'finissaient'), ' leurs exercices.',
    ]
  ),
]

// --- SET 6 — Petit test final (texte libre) -----------------------------------
const fcard = (segments) => ({
  kind: 'segmented',
  tip: TENSE_TIP,
  tipEn: TENSE_TIP_EN,
  segments,
})

const finalCards = [
  fcard([
    'Ce matin, j’', txt('ai ouvert', 'ouvrir'),
    ' toutes les fenêtres parce qu’il ', txt('faisait', 'faire'), ' très beau.',
  ]),
  fcard([
    'Quand j’étais petit, j’', txt('avais', 'avoir'), ' un vélo mais j’',
    txt('allais', 'aller'), ' toujours à l’école en bus.',
  ]),
  fcard([
    'Les enfants ', txt('ont regardé', 'regarder'),
    ' la télévision hier soir parce qu’il y ', txt('avait', 'avoir'),
    ' un très joli film.',
  ]),
  fcard([
    'L’année dernière, nous ', txt('avons acheté', 'acheter'),
    ' un nouveau bateau qui ', txt('était', 'être'), ' blanc et bleu.',
  ]),
  fcard([
    'Nous ', txt('avons offert', 'offrir'),
    ' un cadeau à François parce que c’', txt('était', 'être'), ' son anniversaire.',
  ]),
  fcard([
    'Alain ', txt('a bu', 'boire'), ' un grand verre de bière, parce qu’il ',
    txt('avait', 'avoir'), ' soif.',
  ]),
  fcard([
    'Ce matin, j’', txt('ai pris', 'prendre'), ' mon parapluie, parce qu’il ',
    txt('pleuvait', 'pleuvoir'), '.',
  ]),
  fcard([
    'Paul ', txt('mangeait', 'manger'),
    ' un gâteau au chocolat énorme quand son frère ', txt('est arrivé', 'arriver'),
    '.',
  ]),
  fcard([
    'Vendredi dernier, je ', txt('suis allé', 'aller'),
    ' au théâtre pour voir un spectacle. C’', txt('était', 'être'), ' magnifique.',
  ]),
  fcard([
    'Hier, Gabriel ', txt('était', 'être'), ' au lit parce qu’il ',
    txt('avait', 'avoir'), ' très mal à la tête.',
  ]),
  fcard([
    'Le dimanche, ma mère ', txt('lisait', 'lire'), ' un livre tandis que je ',
    txt('jouais', 'jouer'), ' à l’ordinateur dans ma chambre.',
  ]),
  fcard([
    'J’', txt('étais', 'être'), ' chez le dentiste parce que j’',
    txt('avais', 'avoir'), ' mal aux dents.',
  ]),
  fcard([
    'J’', txt('ai mangé', 'manger'),
    ' un croissant et une brioche parce que j’', txt('avais', 'avoir'), ' faim !',
  ]),
  fcard([
    'Quand la bibliothèque ', txt('était', 'être'), ' fermée, il ',
    txt('allait', 'aller'), ' travailler dans un bar.',
  ]),
  fcard([
    'Ils ', txt('sont sortis', 'sortir'), ' parce qu’ils ',
    txt('voulaient', 'vouloir'), ' danser.',
  ]),
]

// Carte « participes passés » (déplacée du set 2 vers le set 3 : elle ne porte
// que sur la forme du participe passé, pas sur le choix de l'auxiliaire).
const jeanParticiplesCard = {
  kind: 'segmented',
  instruction: 'Écris le participe passé de chaque verbe (petit texte de Jean).',
  tip: 'Terminaisons : -ER → -é, -IR → -i, -RE → -u. Attention aux exceptions (mourir → mort, naître → né).',
  tipEn: 'Endings: -ER → -é, -IR → -i, -RE → -u. Watch the exceptions (mourir → mort, naître → né).',
  segments: [
    'Jean est ', txt('né', 'naître'), ' en 1930. Il est ', txt('mort', 'mourir'),
    ' en 2011. En 2001, il est ', txt('passé', 'passer'),
    ' nous voir à la montagne. Il est ', txt('venu', 'venir'), ' de Paris, il est ',
    txt('arrivé', 'arriver'), ', il est ', txt('monté', 'monter'), ', il est ',
    txt('entré', 'entrer'), ', il est ', txt('resté', 'rester'), ', il est ',
    txt('sorti', 'sortir'), ', il est ', txt('descendu', 'descendre'), ', il est ',
    txt('tombé', 'tomber'), ', il est ', txt('parti', 'partir'), ', il est ',
    txt('allé', 'aller'), ' à Lyon et il est ', txt('retourné', 'retourner'),
    ' à Paris.',
  ],
}

// --- Les SETS ------------------------------------------------------------------
export const SETS = [
  {
    id: 'imparfait',
    num: 1,
    icon: '🕰️',
    title: 'Passé composé ou imparfait ?',
    subtitle: 'Check 1 : choisir le bon temps',
    kind: 'exercises',
    intro:
      'Chaque paire de phrases utilise un temps différent. Choisis la bonne forme : passé composé (action précise, ponctuelle) ou imparfait (habitude, description).',
    cards: check1Cards,
  },
  {
    id: 'auxiliaire',
    num: 2,
    icon: '⚖️',
    title: 'Le bon auxiliaire (être ou avoir)',
    subtitle: 'Check 2 : être ou avoir',
    kind: 'exercises',
    paced: true,
    rewardVideo: 'ttw1KeiF9mA', // chanson récompense (niveau Légende)
    cards: check2Cards,
  },
  {
    id: 'participe',
    num: 3,
    icon: '✍️',
    title: 'Le bon participe passé',
    subtitle: 'Check 3 : la bonne forme (-é / -i / -u)',
    kind: 'exercises',
    paced: true, // 2 slides : la liste de verbes, puis le texte de Jean
    rewardVideo: 'jhqJY0ll1Wo', // chanson récompense (niveau Légende)
    intro:
      'Écris le participe passé de chaque verbe. Pense aux terminaisons -ER → -é, -IR → -i, -RE → -u… et aux exceptions !',
    cards: [{ kind: 'verbs', items: check3Verbs }, jeanParticiplesCard],
  },
  {
    id: 'accord',
    num: 4,
    icon: '🎯',
    title: 'L’accord du participe passé',
    subtitle: 'Check 4 : quand et comment accorder',
    kind: 'exercises',
    rewardVideo: 'Z3f3H9EW53Y', // chanson récompense (niveau Légende)
    intro:
      'Ajoute la terminaison de l’accord au participe passé (par ex. « s », « e », « es »). Laisse vide s’il n’y a pas d’accord !',
    cards: check4Cards,
  },
  {
    id: 'bonus',
    num: 5,
    icon: '🎲',
    title: 'Exercices divers (bonus)',
    subtitle: 'Pour aller plus loin',
    kind: 'links',
    intro:
      'Envie de t’entraîner encore ? Voici d’autres exercices en ligne. Tu peux les refaire autant de fois que tu veux !',
    links: [
      { url: 'https://progress.lawlessfrench.com/kwiz/take/2581800', title: 'Passé composé vs imparfait : Conte de fées (Lawless French)' },
      { url: 'https://progress.lawlessfrench.com/kwiz/take/1702841', title: 'Passé composé vs imparfait : Dimanche à Chartres (Lawless French)' },
      { url: 'https://progress.lawlessfrench.com/kwiz/take/3160218', title: 'Passé composé vs imparfait : Mamie Gâteau (Lawless French)' },
      { url: 'https://progress.lawlessfrench.com/kwiz/take/1782360', title: 'Passé composé vs imparfait : Mon jour férié (Lawless French)' },
      { url: 'https://progress.lawlessfrench.com/kwiz/take/6031271', title: 'Passé composé vs imparfait : Pendant le confinement (Lawless French)' },
      { url: 'https://progress.lawlessfrench.com/kwiz/take/2196089', title: 'Passé composé vs imparfait : Une ville magique (Lawless French)' },
      { url: 'https://www.ecolesuisse-fle.fr/jeux-de-grammaire-accord-du-participe-passe-quiz-progressif', title: 'Accord du participe passé — quiz progressif (École Suisse FLE)' },
      { url: 'https://www.lumni.fr/quiz/comment-accorder-le-participe-passe-employe-avec-etre-avoir', title: 'Accorder le participe passé avec être / avoir (Lumni)' },
      { url: 'https://lesparticipespasses.ccdmd.qc.ca/', title: 'Les participes passés — Mirza chez le vétérinaire (CCDMD)' },
      { url: 'https://exercices.alloprof.qc.ca/app/client.php?demande=questionnaire_debuter&projet=11&questionnaire=126&evaluation=81&mode=', title: 'Choix de l’auxiliaire être / avoir (Alloprof)' },
      { url: 'https://www.lefrancais.be/grammaire/participe-passe/participe-passe-ex1.html', title: 'L’accord du participe passé — exercice 1 (Le Français)' },
    ],
  },
  {
    id: 'final',
    num: 6,
    icon: '🎓',
    title: 'Petit test final',
    subtitle: 'Le grand test : passé composé ou imparfait ?',
    kind: 'exercises',
    requires: ['imparfait', 'auxiliaire', 'participe', 'accord'],
    intro:
      'Le grand test ! Conjugue chaque verbe au passé composé ou à l’imparfait selon le contexte. Écris la forme complète (ex. « ai ouvert », « faisait »).',
    cards: finalCards,
  },
]
