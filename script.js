(function () {
  "use strict";

  const els = {
    title: document.getElementById("app-title"),
    trail: document.getElementById("trail"),
    card: document.getElementById("card"),
  };

  // Historique du parcours : liste de { id, label }
  // label = texte du choix qui a mené à ce noeud (null pour le tout premier noeud)
  let history = [];
  let tree = null;

  init();

  async function init() {
    try {
      const res = await fetch("tree.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      tree = await res.json();
    } catch (err) {
      renderFetchError(err);
      return;
    }

    els.title.textContent = tree.titre || "Arbre de décision";
    history = [{ id: tree.start, label: null }];
    render();
  }

  function currentNode() {
    const currentId = history[history.length - 1].id;
    const node = tree.nodes[currentId];
    if (!node) {
      throw new Error('Noeud introuvable dans tree.json : "' + currentId + '"');
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
        const sep = document.createElement("span");
        sep.className = "trail-sep";
        sep.textContent = "›";
        els.trail.appendChild(sep);
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
    const canGoBack = history.length > 1;

    els.card.innerHTML = "";
    els.card.appendChild(el("span", "card-kicker", "Question"));
    els.card.appendChild(el("h2", null, node.titre || ""));
    els.card.appendChild(el("p", "card-texte", node.texte || ""));

    const choices = el("div", "choices");
    (node.choix || []).forEach((choix) => {
      const btn = el("button", "choice-btn", choix.label);
      btn.type = "button";
      btn.addEventListener("click", () => goToChoice(choix.suivant, choix.label));
      choices.appendChild(btn);
    });
    els.card.appendChild(choices);

    if (canGoBack) {
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

    if (node.liens && node.liens.length) {
      const links = el("div", "links");
      node.liens.forEach((lien) => {
        const a = document.createElement("a");
        a.className = "link-btn";
        a.href = lien.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = lien.label;
        links.appendChild(a);
      });
      els.card.appendChild(links);
    }

    const actions = el("div", "actions-row");
    if (history.length > 1) actions.appendChild(backButton());
    const restartBtn = el("button", "btn-secondary", "Recommencer depuis le début");
    restartBtn.type = "button";
    restartBtn.addEventListener("click", restart);
    actions.appendChild(restartBtn);
    els.card.appendChild(actions);
  }

  function backButton() {
    const btn = el("button", "btn-secondary", "Revenir à la question précédente");
    btn.type = "button";
    btn.addEventListener("click", goBack);
    return btn;
  }

  function renderFetchError(err) {
    els.card.innerHTML = "";
    const box = el(
      "div",
      "error-box",
      "Impossible de charger tree.json. Si vous ouvrez ce fichier directement " +
        "depuis votre ordinateur (file://...), le navigateur bloque cette lecture : " +
        "publiez le dossier sur GitHub Pages, ou lancez un petit serveur local " +
        "(par exemple `python3 -m http.server`) pour tester. Détail technique : " +
        err.message
    );
    els.card.appendChild(box);
  }

  function renderAppError(message) {
    els.card.innerHTML = "";
    els.card.appendChild(
      el("div", "error-box", "Erreur dans tree.json : " + message)
    );
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
})();