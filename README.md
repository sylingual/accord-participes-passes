# Atelier — L'accord des participes passés

Un mini-site **auto-corrigé et en autonomie** pour s'entraîner à l'accord des
participes passés (Français 3ᵉ). Les exercices sont tirés des pages 5 à 14 de
l'atelier de renforcement de L. Merenne (Lycée St-Jacques).

## Comment ça marche pour l'élève

1. L'élève **écrit son prénom** pour démarrer.
2. **Un seul exercice s'affiche à la fois.** Il faut valider sa réponse avant de
   passer au suivant.
3. À chaque validation, un **rappel de la règle** correspondant à la bonne
   réponse apparaît (message court).
4. Après chaque exercice, l'élève choisit :
   - **« Je veux encore m'entraîner. »** → exercice suivant, ou
   - **« C'est trop facile pour moi, je m'arrête là. »** → fin.
   Au tout dernier exercice, la seule option est **« J'ai tout fini ! »**.
5. À la fin, le **nom et le score de l'élève sont envoyés au professeur**
   (voir configuration ci-dessous). L'élève peut aussi télécharger ses résultats.

> **Souplesse sur les accents :** une réponse sans accent (ex. `arrivee` au lieu
> de `arrivée`) est considérée comme **correcte**. En revanche, le nombre et le
> genre comptent (ex. `interrogé` ≠ `interrogés`), car c'est justement la règle
> travaillée.

## Recevoir les résultats par e-mail (EmailJS) — une fois pour toutes

L'envoi passe par **EmailJS** (gratuit, aucun serveur à gérer).

1. Créez un compte sur **https://www.emailjs.com** (gratuit).
2. **Add New Service** (Gmail, Outlook…) → notez le **Service ID**.
3. **Email Templates → Create New Template** :
   - Dans **To Email**, mettez **votre adresse** (celle qui recevra les scores).
   - Dans le sujet / le corps, utilisez les variables, par exemple :
     ```
     Sujet : Participes passés — résultat de {{student_name}}

     {{student_name}} a obtenu {{score}} ({{percent}}).
     Statut : {{outcome}}
     Exercices faits : {{answered}} / {{total}}
     Date : {{date}}

     Détail :
     {{details}}
     ```
   - Notez le **Template ID**.
4. **Account → General** : copiez votre **Public Key**.
5. Ouvrez [`src/emailConfig.js`](src/emailConfig.js) et collez les 3 valeurs
   (`publicKey`, `serviceId`, `templateId`).

Tant que ce n'est pas fait, l'élève peut quand même **télécharger** ses
résultats (`.txt`) à la fin — rien n'est perdu.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrez l'adresse affichée (http://localhost:5173).

## Mettre en ligne

Le site est 100 % statique. Le plus simple :

- **Vercel** : « New Project » → importez ce dépôt GitHub → Deploy.
  (Framework détecté : Vite. Build : `npm run build`, dossier : `dist`.)
- ou **GitHub Pages / Netlify** avec `npm run build` (résultat dans `dist/`).

## Ajouter ou modifier des exercices

Tout est dans [`src/exercises.js`](src/exercises.js) : chaque exercice a un
verbe, la phrase à trous, les réponses acceptées et le rappel de règle.
