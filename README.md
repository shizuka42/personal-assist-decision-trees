# personal-assist-decision-trees

Une petite page web qui pose des questions une par une (avec des boutons) et
mène à une conclusion adaptée. Vous pouvez y publier **plusieurs arbres de
décision** : la page d'accueil permet de choisir lequel parcourir. Tout le
contenu se trouve dans des fichiers JSON du dossier **`data/`** — aucun code à
toucher.

## Fichiers du projet

```
index.html            => la page (structure)
style.css             => l'apparence
script.js             => la logique
data/index.json       => la liste des arbres proposés sur la page d'accueil
data/<nom>.json       => un fichier par arbre (LES FICHIERS À MODIFIER)
data/images/               => vos images (dossier à créer, nom libre)
```

## Ajouter un arbre

1. Créez `data/mon-arbre.json` (le nom ne doit contenir que des lettres sans
   accent, chiffres, `-` ou `_`).
2. Ajoutez `"mon-arbre"` (sans `.json`) dans la liste `"trees"` de
   `data/index.json` :
   ```json
   {
     "title": "Titre de la page d'accueil",
     "description": "Phrase d'introduction (optionnelle).",
     "trees": ["comptes-en-ligne", "mon-arbre"]
   }
   ```
   L'ordre de la liste est l'ordre d'affichage. Un arbre absent de cette liste
   reste accessible par son adresse `…/?arbre=mon-arbre` (pratique pour un
   arbre « caché » ou en préparation).

Chaque arbre commence par :

```json
{
  "title": "Titre affiché sur la page d'accueil et en haut de l'arbre",
  "description": "Courte phrase affichée sous le titre sur la page d'accueil.",
  "start": "id_du_premier_bloc",
  "nodes": { }
}
```

## Modifier un arbre

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

**Une conclusion**, sans choix, avec un texte final :

```json
"c_exemple": {
  "type": "conclusion",
  "titre": "Titre de la conclusion",
  "texte": "Le texte explicatif. Les retours à la ligne sont conservés."
}
```

### Liens et images (questions ET conclusions)

Les deux types de blocs acceptent, en option, une liste `"images"` et une liste
`"liens"` :

```json
"images": [
  { "url": "data/images/schema-connexion.png", "label": "Écran de connexion" },
  { "url": "https://exemple.org/photo.jpg", "label": "Une image en ligne" }
],
"liens": [
  { "label": "Texte du bouton-lien", "url": "https://..." }
]
```

- Les images s'affichent avant les liens. `"label"` sert de légende (et de
  texte alternatif pour l'accessibilité) ; il peut être omis pour les images.
- `"url"` peut être un chemin vers un fichier du dépôt (`images/…`) ou une
  adresse `https://…`.
- Un clic sur une image l'ouvre en grand dans un nouvel onglet.
- **Tous les liens s'ouvrent dans un nouvel onglet**, sans exception.
- Les deux listes peuvent être omises ou laissées à `[]`.

### Règles à respecter

- Chaque bloc a un identifiant unique entre guillemets (ex. `"q1_type_probleme"`),
  unique **dans son arbre** (deux arbres peuvent réutiliser les mêmes noms).
- Chaque `"suivant"` doit correspondre exactement à l'identifiant d'un autre bloc.
- `"start"` indique par quel bloc commencer.
- Attention aux virgules : chaque élément d'une liste est séparé par une
  virgule, sauf le dernier. Un éditeur comme
  [VS Code](https://code.visualstudio.com/) ou [jsonlint.com](https://jsonlint.com/)
  permet de repérer une erreur de syntaxe avant de publier.

## Tester en local avant de publier

Ouvrir directement `index.html` en double-cliquant ne fonctionnera pas (le
navigateur bloque la lecture des fichiers JSON en local). Lancez plutôt, depuis
ce dossier :

```
python -m http.server
```

puis ouvrez `http://localhost:8000`.

## Publier sur GitHub Pages (gratuit)

1. Créez un dépôt sur [github.com](https://github.com).
2. Mettez-y en ligne **tous** les fichiers et dossiers du projet
   (`index.html`, `style.css`, `script.js`, `data/`, `images/`) à la racine.
3. Dans le dépôt : **Settings => Pages**, choisissez la branche `main`
   (dossier `/ root`), puis **Save**.
4. Au bout d'une ou deux minutes, GitHub affiche l'adresse de la page, du type
   `https://votre-nom-utilisateur.github.io/nom-du-depot/`.

Chaque arbre a aussi sa propre adresse directe, par exemple
`https://…github.io/nom-du-depot/?arbre=comptes-en-ligne`.

## Comportement de la page

- La page d'accueil liste les arbres ; un lien « Tous les arbres » permet d'y
  revenir depuis un arbre.
- Les questions s'affichent une par une avec des boutons pour répondre.
- Le fil en haut de page rappelle le chemin suivi ; cliquer dessus permet de
  revenir directement à cette étape.
- Le bouton « Revenir à la question précédente » permet un retour pas à pas.
- Une conclusion propose de « Recommencer depuis le début ».

## Implémentation

> [!NOTE]
> Les implémentations de ce projet ont été assistées par IA (principalement Claude Sonnet 5.0).
