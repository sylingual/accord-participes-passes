// Exercices tirés de l'atelier « L'accord des participes passés »
// (Lycée St-Jacques, Français 3ème — L. Merenne), pages 5 à 14,
// enrichis des règles de formation du participe passé et du passé composé.
//
// Champs d'un exercice :
//   section    : titre de la série (affiché en petit)
//   verb       : l'infinitif à mettre au participe passé
//   verbEn     : traduction anglaise du verbe (bouton « traduire »)
//   context    : phrase-modèle facultative (série « transformation »)
//   before/after : le texte de la phrase autour du trou
//   answers    : réponses acceptées (les accents sont ignorés à la correction)
//   rule       : l'explication (message de correction), en français
//   ruleEn     : la même explication en anglais (bouton « traduire »)
//   examples   : phrases-exemples (niveau A2) ; **texte** = mis en gras
//   examplesEn : les mêmes exemples en anglais

export const exercises = [
  // ---------------------------------------------------------------------------
  // SÉRIE 1 — Rappel : la forme du participe passé
  // ---------------------------------------------------------------------------
  {
    id: 1,
    section: 'Rappel — la forme du participe passé',
    verb: 'prendre',
    verbEn: 'to take',
    before: 'Le participe passé de « prendre » est : ',
    after: '.',
    answers: ['pris'],
    rule: 'Verbe en -RE irrégulier : son participe passé se termine en -IS.',
    ruleEn: 'An irregular -RE verb: its past participle ends in -IS.',
    examples: [
      'J’ai **pris** ta main dans le noir, et tu n’avais plus peur.',
      'Elle a **appris** à faire du vélo avec son grand-père.',
    ],
    examplesEn: [
      'I **took** your hand in the dark, and you were no longer afraid.',
      'She **learned** to ride a bike with her grandpa.',
    ],
  },
  {
    id: 2,
    section: 'Rappel — la forme du participe passé',
    verb: 'découvrir',
    verbEn: 'to discover',
    before: 'Le participe passé de « découvrir » est : ',
    after: '.',
    answers: ['découvert'],
    rule: 'Les verbes en -VRIR et -FFRIR font leur participe passé en -ERT.',
    ruleEn: 'Verbs ending in -VRIR and -FFRIR form their past participle in -ERT.',
    examples: [
      'Elle a **ouvert** la fenêtre pour écouter la pluie.',
      'Il a **offert** une fleur à sa maman, et elle a pleuré de joie.',
    ],
    examplesEn: [
      'She **opened** the window to listen to the rain.',
      'He **gave** his mum a flower, and she cried with joy.',
    ],
  },
  {
    id: 3,
    section: 'Rappel — la forme du participe passé',
    verb: 'mourir',
    verbEn: 'to die',
    before: 'Le participe passé de « mourir » est : ',
    after: '.',
    answers: ['mort'],
    rule: 'Un verbe en -IR fait normalement son participe passé en -I, mais « mourir » est une exception : -T.',
    ruleEn: 'An -IR verb usually forms its past participle in -I, but « mourir » is an exception: -T.',
    examples: [
      'Le vieux chien est **mort** doucement, entouré de sa famille.',
      'Beaucoup de fleurs sont **mortes** cet hiver à cause du gel.',
    ],
    examplesEn: [
      'The old dog **died** peacefully, surrounded by his family.',
      'Many flowers **died** this winter because of the frost.',
    ],
  },
  {
    id: 4,
    section: 'Rappel — la forme du participe passé',
    verb: 'produire',
    verbEn: 'to produce',
    before: 'Le participe passé de « produire » est : ',
    after: '.',
    answers: ['produit'],
    rule: 'Les verbes en -UIRE font leur participe passé en -UIT.',
    ruleEn: 'Verbs ending in -UIRE form their past participle in -UIT.',
    examples: [
      'Le chef a **cuit** un énorme gâteau pour la fête.',
      'Papa a **conduit** toute la nuit pour nous emmener à la mer.',
    ],
    examplesEn: [
      'The chef **baked** a huge cake for the party.',
      'Dad **drove** all night to take us to the sea.',
    ],
  },
  {
    id: 5,
    section: 'Rappel — la forme du participe passé',
    verb: 'inclure',
    verbEn: 'to include',
    before: 'Le participe passé de « inclure » est : ',
    after: '.',
    answers: ['inclus'],
    rule: 'Verbe en -RE irrégulier : « inclure » fait son participe passé en -US. Attention, « conclure » fait « conclu » (sans S) !',
    ruleEn: 'An irregular -RE verb: « inclure » forms its past participle in -US. Careful, « conclure » makes « conclu » (no S)!',
    examples: [
      'Le prix du dessert est **inclus** dans le menu.',
      'Toute la classe est **incluse** dans la sortie : personne n’est oublié.',
    ],
    examplesEn: [
      'The price of the dessert is **included** in the menu.',
      'The whole class is **included** in the trip: nobody is left out.',
    ],
  },
  {
    id: 6,
    section: 'Rappel — la forme du participe passé',
    verb: 'mettre',
    verbEn: 'to put',
    before: 'Le participe passé de « mettre » est : ',
    after: '.',
    answers: ['mis'],
    rule: 'Verbe en -RE irrégulier : son participe passé se termine en -IS.',
    ruleEn: 'An irregular -RE verb: its past participle ends in -IS.',
    examples: [
      'J’ai **mis** mon plus beau pull pour te revoir.',
      'Elle a **promis** de revenir très vite.',
    ],
    examplesEn: [
      'I **put on** my nicest jumper to see you again.',
      'She **promised** to come back very soon.',
    ],
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 2 — Le participe passé employé SEUL (accord avec le nom)
  // ---------------------------------------------------------------------------
  {
    id: 7,
    section: 'Le participe passé employé seul',
    verb: 'parcourir',
    verbEn: 'to travel across / to cover (a distance)',
    before: 'Seule, elle se rappelait ces étroits chemins tant de fois ',
    after: '.',
    answers: ['parcourus'],
    rule: 'Employé seul, le participe passé s’accorde comme un adjectif avec le nom : ici « chemins » (masculin pluriel).',
    ruleEn: 'Used alone, the past participle agrees like an adjective with the noun: here « chemins » (masculine plural).',
    examples: [
      'Les chemins **parcourus** ensemble sont mes plus beaux souvenirs.',
      'Bien **rangée**, la chambre semblait toute neuve.',
    ],
    examplesEn: [
      'The paths **walked** together are my most beautiful memories.',
      'Nicely **tidied**, the room looked brand new.',
    ],
  },
  {
    id: 8,
    section: 'Le participe passé employé seul',
    verb: 'disparaître',
    verbEn: 'to disappear',
    before: '',
    after: ' depuis ce matin, notre chienne est rentrée tout à l’heure.',
    answers: ['disparue'],
    rule: 'Participe passé employé seul → accord avec le nom : « chienne » est féminin singulier.',
    ruleEn: 'Past participle used alone → agreement with the noun: « chienne » is feminine singular.',
    examples: [
      '**Disparue** depuis midi, la petite chatte est enfin rentrée.',
      '**Partis** trop tôt, les invités ont raté le gâteau.',
    ],
    examplesEn: [
      '**Missing** since noon, the little cat finally came home.',
      'Having **left** too early, the guests missed the cake.',
    ],
  },
  {
    id: 9,
    section: 'Le participe passé employé seul',
    verb: 'porter',
    verbEn: 'to carry',
    before: 'Le bruit de la forêt, ',
    after: ' par un vent léger, parvenait jusqu’à nous.',
    answers: ['porté'],
    rule: 'On accorde avec le noyau du groupe : « le bruit » (masculin singulier), pas avec « forêt ».',
    ruleEn: 'You agree with the head noun of the group: « le bruit » (masculine singular), not with « forêt ».',
    examples: [
      '**Porté** par le vent, le parfum des fleurs arrivait jusqu’à nous.',
      'Le petit mot, **écrit** à la main, l’a beaucoup touchée.',
    ],
    examplesEn: [
      '**Carried** by the wind, the scent of the flowers reached us.',
      'The little note, **written** by hand, touched her deeply.',
    ],
  },
  {
    id: 10,
    section: 'Le participe passé employé seul',
    verb: 'interroger',
    verbEn: 'to question',
    before: 'Les témoins ',
    after: ' n’ont pu répondre.',
    answers: ['interrogés'],
    rule: 'Participe passé employé seul → accord avec « les témoins » (masculin pluriel).',
    ruleEn: 'Past participle used alone → agreement with « les témoins » (masculine plural).',
    examples: [
      '**Interrogés** par la police, les témoins ont tout raconté.',
      '**Félicités** par le professeur, les élèves souriaient.',
    ],
    examplesEn: [
      '**Questioned** by the police, the witnesses told everything.',
      '**Congratulated** by the teacher, the students were smiling.',
    ],
  },
  {
    id: 11,
    section: 'Le participe passé employé seul',
    verb: 'casser',
    verbEn: 'to break',
    before: 'Sa jambe et son bras ',
    after: ' l’obligent à rester chez lui.',
    answers: ['cassés'],
    rule: 'Deux noms dont un masculin (« jambe » + « bras ») → accord au masculin pluriel.',
    ruleEn: 'Two nouns, one of them masculine (« jambe » + « bras ») → agreement in the masculine plural.',
    examples: [
      'Sa jambe et son bras **cassés** le font beaucoup souffrir.',
      'Le stylo et la règle **oubliés** sont restés à l’école.',
    ],
    examplesEn: [
      'His **broken** leg and arm hurt him a lot.',
      'The **forgotten** pen and ruler stayed at school.',
    ],
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 3 — Le participe passé avec l'auxiliaire ÊTRE (accord avec le sujet)
  // ---------------------------------------------------------------------------
  {
    id: 12,
    section: 'Le participe passé avec ÊTRE',
    verb: 'fermer',
    verbEn: 'to close',
    before: 'La porte n’est pas ',
    after: ' à clé.',
    answers: ['fermée'],
    rule: 'Avec ÊTRE, le participe passé s’accorde avec le sujet : « la porte » (féminin singulier).',
    ruleEn: 'With ÊTRE, the past participle agrees with the subject: « la porte » (feminine singular).',
    examples: [
      'La porte est **fermée**, mais la fenêtre est **ouverte**.',
      'La lettre est enfin **arrivée** !',
    ],
    examplesEn: [
      'The door is **closed**, but the window is **open**.',
      'The letter has finally **arrived**!',
    ],
  },
  {
    id: 13,
    section: 'Le participe passé avec ÊTRE',
    verb: 'accueillir',
    verbEn: 'to welcome',
    before: 'Ses parents avaient été ',
    after: ' très chaleureusement.',
    answers: ['accueillis'],
    rule: 'Avec ÊTRE, accord avec le sujet « ses parents » (masculin pluriel).',
    ruleEn: 'With ÊTRE, agreement with the subject « ses parents » (masculine plural).',
    examples: [
      'Ses parents ont été **accueillis** avec un grand sourire.',
      'Les voyageurs sont **rentrés** heureux de leur journée.',
    ],
    examplesEn: [
      'His parents were **welcomed** with a big smile.',
      'The travellers **came home** happy after their day.',
    ],
  },
  {
    id: 14,
    section: 'Le participe passé avec ÊTRE',
    verb: 'régler',
    verbEn: 'to settle / to sort out',
    before: 'Les affaires de ton oncle furent ',
    after: ' dès mon retour.',
    answers: ['réglées'],
    rule: 'Avec ÊTRE, accord avec le sujet « les affaires » (féminin pluriel).',
    ruleEn: 'With ÊTRE, agreement with the subject « les affaires » (feminine plural).',
    examples: [
      'Une fois **réglées**, les affaires ont été vite oubliées.',
      'Les valises sont déjà **préparées** pour le grand départ.',
    ],
    examplesEn: [
      'Once **settled**, the matters were quickly forgotten.',
      'The suitcases are already **packed** for the big trip.',
    ],
  },
  {
    id: 15,
    section: 'Le participe passé avec ÊTRE',
    verb: 'arriver',
    verbEn: 'to arrive',
    before: 'As-tu vu ma grand-mère lorsqu’elle est ',
    after: ' ?',
    answers: ['arrivée'],
    rule: 'Avec ÊTRE, accord avec le sujet « elle » (féminin singulier).',
    ruleEn: 'With ÊTRE, agreement with the subject « elle » (feminine singular).',
    examples: [
      'Elle est **arrivée** la première, toute essoufflée.',
      'Grand-mère est **venue** nous faire un gros câlin.',
    ],
    examplesEn: [
      'She **arrived** first, all out of breath.',
      'Grandma **came** to give us a big hug.',
    ],
  },
  {
    id: 16,
    section: 'Le participe passé avec ÊTRE',
    verb: 'sortir',
    verbEn: 'to go out',
    before: 'Tous les chiens sont ',
    after: ' de l’enclos.',
    answers: ['sortis'],
    rule: 'Avec ÊTRE, accord avec le sujet « tous les chiens » (masculin pluriel).',
    ruleEn: 'With ÊTRE, agreement with the subject « tous les chiens » (masculine plural).',
    examples: [
      'Les chiens sont **sortis** en courant dans le jardin.',
      'Les enfants sont **montés** dans le train, tout excités.',
    ],
    examplesEn: [
      'The dogs **ran out** into the garden.',
      'The children **got on** the train, very excited.',
    ],
  },
  {
    id: 17,
    section: 'Le participe passé avec ÊTRE',
    verb: 'terminer',
    verbEn: 'to finish',
    before: 'Ils sortirent dès que la toilette des enfants fut ',
    after: '.',
    answers: ['terminée'],
    rule: 'Avec ÊTRE, accord avec le sujet « la toilette » (féminin singulier), pas avec « enfants ».',
    ruleEn: 'With ÊTRE, agreement with the subject « la toilette » (feminine singular), not with « enfants ».',
    examples: [
      'La fête est **terminée**, mais les sourires restent.',
      'La chanson est **finie**, et tout le monde applaudit.',
    ],
    examplesEn: [
      'The party is **over**, but the smiles remain.',
      'The song is **finished**, and everyone claps.',
    ],
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 4 — Le participe passé avec l'auxiliaire AVOIR
  // ---------------------------------------------------------------------------
  {
    id: 18,
    section: 'Le participe passé avec AVOIR',
    verb: 'louer',
    verbEn: 'to rent / to book',
    before: 'Avez-vous ',
    after: ' votre place ?',
    answers: ['loué'],
    rule: 'Avec AVOIR : pas d’accord car le COD « votre place » est placé APRÈS le verbe.',
    ruleEn: 'With AVOIR: no agreement, because the direct object « votre place » comes AFTER the verb.',
    examples: [
      'Nous avons **loué** un petit bateau pour la journée.',
      'Ils ont **réservé** une table juste devant la mer.',
    ],
    examplesEn: [
      'We **rented** a little boat for the day.',
      'They **booked** a table right by the sea.',
    ],
  },
  {
    id: 19,
    section: 'Le participe passé avec AVOIR',
    verb: 'étonner',
    verbEn: 'to amaze / to astonish',
    before: 'Elle a ',
    after: ' ses parents.',
    answers: ['étonné'],
    rule: 'Avec AVOIR : le COD « ses parents » est placé APRÈS → pas d’accord.',
    ruleEn: 'With AVOIR: the direct object « ses parents » comes AFTER → no agreement.',
    examples: [
      'Elle a **étonné** tout le monde avec sa belle chanson.',
      'Le magicien a **surpris** les enfants émerveillés.',
    ],
    examplesEn: [
      'She **amazed** everyone with her beautiful song.',
      'The magician **surprised** the delighted children.',
    ],
  },
  {
    id: 20,
    section: 'Le participe passé avec AVOIR',
    verb: 'diriger',
    verbEn: 'to lead / to guide',
    before: 'Les enfants que nous avons ',
    after: ' ont suivi nos conseils.',
    answers: ['dirigés'],
    rule: 'Avec AVOIR : accord avec le COD placé AVANT. « que » = les enfants (masculin pluriel).',
    ruleEn: 'With AVOIR: agreement with the direct object placed BEFORE. « que » = the children (masculine plural).',
    examples: [
      'Les enfants que nous avons **dirigés** ont bien écouté.',
      'Les amis qu’elle a **invités** sont tous venus.',
    ],
    examplesEn: [
      'The children we **guided** listened carefully.',
      'The friends she **invited** all came.',
    ],
  },
  {
    id: 21,
    section: 'Le participe passé avec AVOIR',
    verb: 'donner',
    verbEn: 'to give',
    before: 'Voici les outils qu’il m’a ',
    after: '.',
    answers: ['donnés'],
    rule: 'Avec AVOIR : accord avec le COD placé AVANT. « qu’ » = les outils (masculin pluriel).',
    ruleEn: 'With AVOIR: agreement with the direct object placed BEFORE. « qu’ » = the tools (masculine plural).',
    examples: [
      'Voici les outils qu’il m’a **donnés**.',
      'Je garde précieusement les livres que tu m’as **prêtés**.',
    ],
    examplesEn: [
      'Here are the tools he **gave** me.',
      'I carefully keep the books you **lent** me.',
    ],
  },
  {
    id: 22,
    section: 'Le participe passé avec AVOIR',
    verb: 'écrire',
    verbEn: 'to write',
    before: 'Voici les dernières lettres que Victor Hugo ait ',
    after: ' !',
    answers: ['écrites'],
    rule: 'Avec AVOIR : accord avec le COD placé AVANT. « que » = les lettres (féminin pluriel).',
    ruleEn: 'With AVOIR: agreement with the direct object placed BEFORE. « que » = the letters (feminine plural).',
    examples: [
      'Les lettres qu’il a **écrites** sont pleines d’amour.',
      'Les histoires que grand-père a **racontées** me manquent.',
    ],
    examplesEn: [
      'The letters he **wrote** are full of love.',
      'I miss the stories that grandpa **told**.',
    ],
  },
  {
    id: 23,
    section: 'Le participe passé avec AVOIR',
    verb: 'corriger',
    verbEn: 'to correct',
    before: 'Ce sont toutes les fautes de frappe qu’il a ',
    after: ' dans ce texte.',
    answers: ['corrigées'],
    rule: 'Avec AVOIR : accord avec le COD placé AVANT. « qu’ » = les fautes (féminin pluriel).',
    ruleEn: 'With AVOIR: agreement with the direct object placed BEFORE. « qu’ » = the mistakes (feminine plural).',
    examples: [
      'Les fautes qu’il a **corrigées** ont toutes disparu.',
      'Les photos que j’ai **choisies** sont sur le mur.',
    ],
    examplesEn: [
      'The mistakes he **corrected** have all disappeared.',
      'The photos I **chose** are on the wall.',
    ],
  },
  {
    id: 24,
    section: 'Le participe passé avec AVOIR',
    verb: 'offrir',
    verbEn: 'to give (a gift)',
    before: 'As-tu ',
    after: ' un cadeau à ta sœur pour son anniversaire ?',
    answers: ['offert'],
    rule: 'Avec AVOIR : le COD « un cadeau » est placé APRÈS → pas d’accord.',
    ruleEn: 'With AVOIR: the direct object « un cadeau » comes AFTER → no agreement.',
    examples: [
      'Il a **offert** un joli cadeau à sa petite sœur.',
      'Nous avons **préparé** une surprise pour maman.',
    ],
    examplesEn: [
      'He **gave** his little sister a lovely present.',
      'We **prepared** a surprise for mum.',
    ],
  },
  {
    id: 25,
    section: 'Le participe passé avec AVOIR',
    verb: 'penser',
    verbEn: 'to think',
    before: 'Y as-tu ',
    after: ' ?',
    answers: ['pensé'],
    rule: '« penser à » n’a pas de COD (c’est un complément indirect) → jamais d’accord.',
    ruleEn: '« penser à » has no direct object (it is an indirect complement) → never any agreement.',
    examples: [
      'As-tu **pensé** à ton amie qui est malade ?',
      'Ils ont **parlé** de leurs vacances toute la soirée.',
    ],
    examplesEn: [
      'Did you **think** about your friend who is ill?',
      'They **talked** about their holidays all evening.',
    ],
  },
  {
    id: 26,
    section: 'Le participe passé avec AVOIR',
    verb: 'trouver',
    verbEn: 'to find',
    context: 'La solution ? Mais il ne l’a pas …',
    before: 'La solution ? Mais il ne l’a pas ',
    after: '.',
    answers: ['trouvée'],
    rule: 'Avec AVOIR : « l’ » (= la solution) est un COD placé AVANT → accord au féminin singulier.',
    ruleEn: 'With AVOIR: « l’ » (= the solution) is a direct object placed BEFORE → feminine singular agreement.',
    examples: [
      'La solution ? Il ne l’a pas **trouvée**.',
      'Ma clé perdue, je l’ai enfin **retrouvée** !',
    ],
    examplesEn: [
      'The solution? He didn’t **find** it.',
      'My lost key — I finally **found** it again!',
    ],
  },
  {
    id: 27,
    section: 'Le participe passé avec AVOIR',
    verb: 'envoyer',
    verbEn: 'to send',
    before: 'Lui as-tu envoyé des roses ? Oui, je lui en ai ',
    after: '.',
    answers: ['envoyé'],
    rule: 'Avec AVOIR : jamais d’accord avec le pronom « EN ».',
    ruleEn: 'With AVOIR: never any agreement with the pronoun « EN ».',
    examples: [
      'Des roses ? Je lui en ai **envoyé** pour lui dire merci.',
      'Des bonbons ? Ils en ont **mangé** beaucoup trop !',
    ],
    examplesEn: [
      'Roses? I **sent** her some to say thank you.',
      'Sweets? They **ate** far too many of them!',
    ],
  },

  // ---------------------------------------------------------------------------
  // SÉRIE 5 — Transformation : verbe + nom → nom + participe passé accordé
  // Modèle : livrer le charbon → le charbon livré
  // ---------------------------------------------------------------------------
  {
    id: 28,
    section: 'Transformation (participe passé adjectif)',
    verb: 'saisir',
    verbEn: 'to grab / to seize',
    context: 'saisir le papillon  →  le papillon …',
    before: 'le papillon ',
    after: '',
    answers: ['saisi'],
    rule: 'Le participe passé employé comme adjectif s’accorde avec le nom : « le papillon » (masculin singulier).',
    ruleEn: 'A past participle used as an adjective agrees with the noun: « le papillon » (masculine singular).',
    examples: [
      'Le papillon **saisi** entre ses mains tremblait un peu.',
      'Le trésor **caché** attend son explorateur.',
    ],
    examplesEn: [
      'The butterfly **held** in his hands was trembling a little.',
      'The **hidden** treasure waits for its explorer.',
    ],
  },
  {
    id: 29,
    section: 'Transformation (participe passé adjectif)',
    verb: 'choisir',
    verbEn: 'to choose',
    context: 'choisir la cravate  →  la cravate …',
    before: 'la cravate ',
    after: '',
    answers: ['choisie'],
    rule: 'Participe passé adjectif → accord avec « la cravate » (féminin singulier).',
    ruleEn: 'Adjective past participle → agreement with « la cravate » (feminine singular).',
    examples: [
      'La cravate **choisie** par papa est magnifique.',
      'La chanson **préférée** de maman passe à la radio.',
    ],
    examplesEn: [
      'The tie **chosen** by dad is beautiful.',
      'Mum’s **favourite** song is on the radio.',
    ],
  },
  {
    id: 30,
    section: 'Transformation (participe passé adjectif)',
    verb: 'remettre',
    verbEn: 'to hand in / to hand over',
    context: 'remettre une lettre  →  une lettre …',
    before: 'une lettre ',
    after: '',
    answers: ['remise'],
    rule: 'Participe passé adjectif → accord avec « une lettre » (féminin singulier).',
    ruleEn: 'Adjective past participle → agreement with « une lettre » (feminine singular).',
    examples: [
      'Une lettre **remise** en main propre, quelle joie !',
      'Une promesse **tenue** rend le cœur tout léger.',
    ],
    examplesEn: [
      'A letter **handed over** in person — what joy!',
      'A promise **kept** makes the heart feel light.',
    ],
  },
  {
    id: 31,
    section: 'Transformation (participe passé adjectif)',
    verb: 'peindre',
    verbEn: 'to paint',
    context: 'peindre l’étagère  →  l’étagère …',
    before: 'l’étagère ',
    after: '',
    answers: ['peinte'],
    rule: 'Les verbes en -INDRE font leur participe passé en -T ; ici, accord avec « l’étagère » (féminin singulier).',
    ruleEn: 'Verbs ending in -INDRE form their past participle in -T; here it agrees with « l’étagère » (feminine singular).',
    examples: [
      'L’étagère **peinte** en bleu sèche au soleil.',
      'La porte **repeinte** brille comme si elle était neuve.',
    ],
    examplesEn: [
      'The shelf **painted** blue is drying in the sun.',
      'The **repainted** door shines as if it were new.',
    ],
  },
  {
    id: 32,
    section: 'Transformation (participe passé adjectif)',
    verb: 'atteindre',
    verbEn: 'to reach',
    context: 'atteindre le sommet  →  le sommet …',
    before: 'le sommet ',
    after: '',
    answers: ['atteint'],
    rule: 'Les verbes en -INDRE font leur participe passé en -T ; ici, accord avec « le sommet » (masculin singulier).',
    ruleEn: 'Verbs ending in -INDRE form their past participle in -T; here it agrees with « le sommet » (masculine singular).',
    examples: [
      'Le sommet **atteint**, ils ont pleuré de bonheur.',
      'Le but **atteint**, toute l’équipe a sauté de joie.',
    ],
    examplesEn: [
      'The summit **reached**, they cried with happiness.',
      'The goal **reached**, the whole team jumped for joy.',
    ],
  },
]
