# personal-assist-decision-trees

Une petite page web qui pose des questions une par une (avec des boutons) et
mène à une conclusion adaptée. Tout le contenu (questions, choix, conclusions)
se trouve dans **`tree.json`** — aucun code à toucher pour le modifier.

## Fichiers du projet

```
index.html   → la page (structure)
style.css    → l'apparence
script.js    → la logique (lit tree.json et affiche les questions)
tree.json    → LE FICHIER À MODIFIER : le contenu de l'arbre
```

## Modifier l'arbre

Ouvrez `tree.json` dans un éditeur de texte simple (Bloc-notes, VS Code...).

Deux types de blocs dans `nodes` :

**Une question**, avec des choix qui mènent chacun à un autre bloc :

```json
"q_exemple": {
  "type": "question",
  "titre": "Titre affiché en gros",
  "texte": "Phrase d'explication, optionnelle (peut être vide : \"\").",
  "choix": [
    { "label": "Texte du premier bouton", "suivant": "id_du_noeud_suivant" },
    { "label": "Texte du deuxième bouton", "suivant": "un_autre_id" }
  ]
}
```

**Une conclusion**, sans choix, avec un texte final et des liens optionnels :

```json
"c_exemple": {
  "type": "conclusion",
  "titre": "Titre de la conclusion",
  "texte": "Le texte explicatif. Les retours à la ligne sont conservés.",
  "liens": [
    { "label": "Texte du bouton-lien", "url": "https://..." }
  ]
}
```

Règles à respecter :

- Chaque bloc a un identifiant unique entre guillemets (ex. `"q1_type_probleme"`).
  Le nom est libre, mais il doit être le même partout où on le référence.
- Chaque `"suivant"` doit correspondre exactement à l'identifiant d'un autre bloc.
- `"liens"` peut être omis ou laissé à `[]` si la conclusion n'a pas de lien.
- `"start"` (tout en haut du fichier) indique par quel bloc commencer.
- Attention aux virgules : chaque élément d'une liste est séparé par une
  virgule, sauf le dernier. Un éditeur comme
  [VS Code](https://code.visualstudio.com/) ou une vérification sur
  [jsonlint.com](https://jsonlint.com/) permet de repérer une erreur de syntaxe
  avant de publier.

Après modification, il suffit de recharger la page (ou de republier sur
GitHub Pages) pour voir le changement — rien d'autre à faire.

## Tester en local avant de publier

Ouvrir directement `index.html` en double-cliquant ne fonctionnera pas
(le navigateur bloque la lecture de `tree.json` en local pour des raisons de
sécurité). Deux solutions simples :

- Lancer un petit serveur local depuis ce dossier :
  ```
  python -m http.server
  ```
  puis ouvrir `http://localhost:8000` dans un navigateur.
- Ou directement tester en ligne une fois publié sur GitHub Pages (voir
  ci-dessous) : c'est en réalité le plus simple.

## Publier sur GitHub Pages (gratuit)

1. Créer un compte GitHub si besoin ([github.com](https://github.com)).
2. Créer un nouveau dépôt (repository), par exemple nommé `aide-comptes`.
3. Mettre en ligne les 4 fichiers de ce dossier (`index.html`, `style.css`,
   `script.js`, `tree.json`) à la racine du dépôt :
   - soit en les glissant-déposant directement sur la page du dépôt via
     "Add file" → "Upload files" sur le site github.com,
   - soit via `git` si vous êtes à l'aise avec.
4. Dans le dépôt, aller dans **Settings → Pages**.
5. Sous "Build and deployment", choisir la branche `main` (dossier `/ root`),
   puis **Save**.
6. Au bout d'une ou deux minutes, GitHub affiche l'adresse de la page,
   du type : `https://votre-nom-utilisateur.github.io/aide-comptes/`.

Cette adresse peut ensuite être partagée ou mise en favori. Toute future
modification de `tree.json` poussée sur GitHub met à jour la page en
quelques minutes automatiquement.

## Comportement de la page

- Les questions s'affichent une par une avec des boutons pour répondre.
- Le fil en haut de page (ex. *Problème de connexion › Mot de passe oublié*)
  rappelle le chemin suivi ; cliquer dessus permet de revenir en arrière
  directement à cette étape.
- Le bouton "Revenir à la question précédente" permet un retour simple, pas à
  pas.
- Une conclusion peut afficher des liens utiles (boutons ouvrant un nouvel
  onglet) et propose de "Recommencer depuis le début".