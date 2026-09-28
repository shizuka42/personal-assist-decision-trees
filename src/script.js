(function () {
  "use strict";

  const APP_VERSION = document.querySelector('meta[name="app-version"]')?.content || "";
  const DATA_DIR = "data/";

  const els = {
    home: document.getElementById("home-link"),
    title: document.getElementById("app-title"),
    trail: document.getElementById("trail"),
    card: document.getElementById("card"),
  };

  // Historique du parcours : liste de { id, label }
  // label = texte du choix qui a mené à ce noeud (null pour le tout premier noeud)
  let history = [];
  let tree = null;
  let treeFile = "";

  init();

  // ------------------------------------------------------------
  // Routage : "?arbre=xxx" ouvre data/xxx.json, sinon page d'accueil
  // ------------------------------------------------------------
  function init() {
    const id = new URLSearchParams(location.search).get("arbre");
    if (id) showTree(id);
    else showHome();
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  // ------------------------------------------------------------
  // Page d'accueil : liste des arbres déclarés dans data/index.json
  // ------------------------------------------------------------
  async function showHome() {
    let manifest;
    try {
      manifest = await fetchJSON(DATA_DIR + "index.json");
    } catch (err) {
      renderFetchError(DATA_DIR + "index.json", err);
      return;
    }

    const pageTitle = manifest.title || "Arbres de décision";
    els.title.textContent = pageTitle;
    document.title = pageTitle;

    const ids = manifest.trees || [];
    const results = await Promise.allSettled(
      ids.map((id) => fetchJSON(DATA_DIR + id + ".json"))
    );

    els.card.innerHTML = "";
    els.card.appendChild(
      el("p", "card-texte", manifest.description || "Choisissez un sujet.")
    );

    const list = el("div", "choices");
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        const a = el("a", "choice-btn tree-link");
        a.href = "?arbre=" + encodeURIComponent(ids[i]);
        a.appendChild(el("span", "tree-link-title", data.title || data.titre || ids[i]));
        if (data.description) {
          a.appendChild(el("span", "tree-link-desc", data.description));
        }
        list.appendChild(a);
      } else {
        list.appendChild(
          el(
            "div",
            "error-box",
            "Impossible de charger " + DATA_DIR + ids[i] + ".json (" +
              result.reason.message + "). Vérifiez le nom dans data/index.json."
          )
        );
      }
    });
    if (!ids.length) {
      list.appendChild(el("div", "error-box", "Aucun arbre n'est listé dans data/index.json."));
    }
    els.card.appendChild(list);
  }

  // ------------------------------------------------------------
  // Parcours d'un arbre
  // ------------------------------------------------------------
  async function showTree(id) {
    els.home.hidden = false;
    treeFile = DATA_DIR + id + ".json";

    if (!/^[\w-]+$/.test(id)) {
      renderAppError('Nom d\'arbre invalide : "' + id + '"');
      return;
    }
    try {
      tree = await fetchJSON(treeFile);
    } catch (err) {
      renderFetchError(treeFile, err);
      return;
    }

    const title = tree.title || tree.titre || "Arbre de décision";
    els.title.textContent = title;
    document.title = title;
    history = [{ id: tree.start, label: null }];
    render();
  }

  function currentNode() {
    const currentId = history.at(- 1).id;
    const node = tree.nodes[currentId];
    if (!node) {
      throw new Error('Noeud introuvable dans ' + treeFile + ' : "' + currentId + '"');
    }
    return node;
  }

  function goToChoice(nextId, label) {
    history.push({ id: nextId, label: label });
    render();
    els.card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    if (history.length > 1) {
      history.pop();
      render();
    }
  }

  function restart() {
    history = [{ id: tree.start, label: null }];
    render();
  }

  function jumpTo(index) {
    history = history.slice(0, index + 1);
    render();
  }

  function render() {
    renderTrail();
    let node;
    try {
      node = currentNode();
    } catch (err) {
      renderAppError(err.message);
      return;
    }
    if (node.type === "conclusion") {
      renderConclusion(node);
    } else {
      renderQuestion(node);
    }
  }

  function renderTrail() {
    els.trail.innerHTML = "";
    history.forEach((step, index) => {
      if (step.label === null) return; // pas d'entrée pour le noeud de départ

      if (index > 0) {
        els.trail.appendChild(el("span", "trail-sep", "›"));
      }

      const isCurrent = index === history.length - 1;
      const item = document.createElement(isCurrent ? "span" : "button");
      item.className = "trail-item" + (isCurrent ? " current" : "");
      item.textContent = step.label;
      item.title = step.label;
      if (!isCurrent) {
        item.type = "button";
        item.addEventListener("click", () => jumpTo(index));
      }
      els.trail.appendChild(item);
    });
  }

  function renderQuestion(node) {
    els.card.innerHTML = "";
    els.card.appendChild(el("span", "card-kicker", "Question"));
    els.card.appendChild(el("h2", null, node.titre || ""));
    els.card.appendChild(el("p", "card-texte", node.texte || ""));
    appendImagesAndLinks(node);

    const choices = el("div", "choices");
    (node.choix || []).forEach((choix) => {
      const btn = el("button", "choice-btn", choix.label);
      btn.type = "button";
      btn.addEventListener("click", () => goToChoice(choix.suivant, choix.label));
      choices.appendChild(btn);
    });
    els.card.appendChild(choices);

    if (history.length > 1) {
      const actions = el("div", "actions-row");
      actions.appendChild(backButton());
      els.card.appendChild(actions);
    }
  }

  function renderConclusion(node) {
    els.card.innerHTML = "";
    els.card.appendChild(el("span", "card-kicker", "Conclusion"));
    els.card.appendChild(el("h2", null, node.titre || ""));
    els.card.appendChild(el("p", "conclusion-texte", node.texte || ""));
    appendImagesAndLinks(node);

    const actions = el("div", "actions-row");
    if (history.length > 1) actions.appendChild(backButton());
    const restartBtn = el("button", "btn-secondary", "Recommencer depuis le début");
    restartBtn.type = "button";
    restartBtn.addEventListener("click", restart);
    actions.appendChild(restartBtn);
    els.card.appendChild(actions);
  }

  // Images ("images") puis liens ("liens"), pour les questions comme pour les conclusions.
  function appendImagesAndLinks(node) {
    if (node.images?.length) {
      const box = el("div", "images");
      node.images.forEach((img) => box.appendChild(buildImage(img)));
      els.card.appendChild(box);
    }
    if (node.liens?.length) {
      const box = el("div", "links");
      node.liens.forEach((lien) => {
        const a = newTabLink(lien.url, lien.label);
        a.className = "link-btn";
        a.textContent = lien.label;
        box.appendChild(a);
      });
      els.card.appendChild(box);
    }
  }

  function versioned(url) {
    // pas de version en local, ni pour les images externes (https://...)
    if (!APP_VERSION || /^(https?:)?\/\//.test(url)) return url;
    return url + (url.includes("?") ? "&" : "?") + "v=" + APP_VERSION;
  }

  function buildImage(img) {
    const fig = el("figure", "image-item");
    // Un clic sur l'image l'ouvre en grand dans un nouvel onglet
    const a = newTabLink(img.url, img.label || "Image");
    a.className = "image-link";

    const image = document.createElement("img");
    image.src = versioned(img.url);
    image.alt = img.label || "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      fig.replaceChildren(el("div", "error-box", "Image introuvable : " + img.url));
    });
    a.appendChild(image);
    fig.appendChild(a);

    if (img.label) {
      const cap = el("figcaption", null, img.label);
      cap.setAttribute("aria-hidden", "true");
      fig.appendChild(cap);
    }
    return fig;
  }

  // Tous les liens du site passent par ici : toujours un nouvel onglet.
  function newTabLink(url, name) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", name + " (s'ouvre dans un nouvel onglet)");
    return a;
  }

  function backButton() {
    const btn = el("button", "btn-secondary", "Revenir à la question précédente");
    btn.type = "button";
    btn.addEventListener("click", goBack);
    return btn;
  }

  function renderFetchError(file, err) {
    els.card.innerHTML = "";
    els.card.appendChild(
      el(
        "div",
        "error-box",
        "Impossible de charger " + file + ". Vérifiez que le fichier existe et " +
          "que son nom est exact. Si vous ouvrez cette page directement depuis " +
          "votre ordinateur (file://...), le navigateur bloque cette lecture : " +
          "publiez sur GitHub Pages, ou lancez un petit serveur local " +
          "(par exemple `python3 -m http.server`). Détail technique : " +
          err.message
      )
    );
  }

  function renderAppError(message) {
    els.card.innerHTML = "";
    els.card.appendChild(el("div", "error-box", "Erreur : " + message));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
})();
