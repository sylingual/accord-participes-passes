# Atelier — Le passé composé & l'accord des participes passés

Un mini-site **auto-corrigé et en autonomie** pour s'entraîner au passé composé
et à l'accord des participes passés (Français 3ᵉ), organisé selon les **4 checks**
du passé composé + un set bonus.

## Comment ça marche pour l'élève

1. L'élève **écrit son prénom**.
2. Il arrive sur un **menu de 5 sets** et choisit celui où s'entraîner. Chaque set
   affiche son propre **score et niveau** (Apprenti → Aventurier → Champion →
   Héros → Légende), conservés d'une fois sur l'autre (dans le navigateur).
3. Les 5 sets :
   1. **Passé composé ou imparfait ?** — 6 quiz Lawless French (liens à cocher).
   2. **Le bon auxiliaire (être ou avoir)** — 3 exercices : menus déroulants
      être/avoir, participes passés, puis une petite histoire ligne par ligne.
   3. **Le bon participe passé** — les formes -ER/-IR/-RE + exceptions.
   4. **L'accord du participe passé** — ajouter la terminaison (ou rien).
   5. **Exercices divers (bonus)** — d'autres liens externes.
4. À la fin d'un set noté, l'élève voit son **niveau** et le **corrigé complet**.

> **Souplesse sur les accents :** une réponse sans accent (ex. `arrivee` au lieu
> de `arrivée`) est **correcte**. En revanche, le nombre et le genre comptent
> (ex. `interrogé` ≠ `interrogés`), car c'est la règle travaillée.

## Suivi des résultats (Google Sheet)

À chaque set noté terminé, l'app peut ajouter une ligne dans **ton Google Sheet**
(Horodatage · Élève · Set · Score · Réussite % · Niveau). Aucun e-mail, aucun
serveur : ça passe par un petit **Google Apps Script**. Mise en place (~5 min) :

1. Crée un **Google Sheet** (vide).
2. Menu **Extensions → Apps Script**.
3. Efface le code et **colle le contenu de [`apps-script.gs`](apps-script.gs)**.
4. **Déployer → Nouveau déploiement → Application web** :
   - *Exécuter en tant que* : **Moi**
   - *Qui a accès* : **Tout le monde**
5. Autorise l'accès, puis **copie l'URL** du déploiement (elle finit par `/exec`).
6. Colle cette URL dans [`src/statsConfig.js`](src/statsConfig.js) (`sheetsUrl`),
   puis redéploie le site.

Tant que ce n'est pas fait, l'app fonctionne normalement mais n'enregistre rien.
Les scores restent visibles dans le menu de l'élève (stockage local du
navigateur).

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvre l'adresse affichée (http://localhost:5173).

## Mettre en ligne

Site 100 % statique :

- **Vercel** : « New Project » → importe ce dépôt GitHub → Deploy.
  (Framework détecté : Vite. Build : `npm run build`, dossier : `dist`.)
- ou **GitHub Pages / Netlify** avec `npm run build` (résultat dans `dist/`).

## Modifier / ajouter des exercices

Tout le contenu est dans [`src/setsData.js`](src/setsData.js) : les 5 sets, leurs
liens, et les exercices (verbes, phrases, réponses, règles, exemples). Le moteur
et l'affichage sont dans [`src/App.jsx`](src/App.jsx).
