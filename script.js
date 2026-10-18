// Portfolio de Jean-Baptiste Caignec : petites interactions, sans dépendance.
// Le site reste entièrement utilisable sans JavaScript : ce script ne fait
// qu'ajouter des effets et l'envoi du formulaire sans rechargement.

"use strict";

document.documentElement.classList.add("js");

const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Langue de la page (WEB_UI_LANGUAGE côté serveur) : anglais sauf si la page
// est en français.
const LANGUE = document.documentElement.lang === "fr" ? "fr" : "en";
const traduire = (textes) => textes[LANGUE];

// Année du pied de page
document.querySelectorAll(".annee").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

// Effet « machine à écrire » sur la ligne du hero
const tape = document.querySelector(".tape");
if (tape && !mouvementReduit) {
  const texte = tape.dataset.texte || tape.textContent;
  tape.textContent = "";
  let i = 0;
  const ecrire = () => {
    tape.textContent = texte.slice(0, ++i);
    if (i < texte.length) {
      setTimeout(ecrire, 35 + Math.random() * 45);
    }
  };
  setTimeout(ecrire, 500);
}

// Apparition des panneaux au défilement
const aReveler = document.querySelectorAll(".revele");
if ("IntersectionObserver" in window && !mouvementReduit) {
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          observateur.unobserve(entree.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  aReveler.forEach((el) => observateur.observe(el));
} else {
  aReveler.forEach((el) => el.classList.add("visible"));
}

// Formulaire de contact : envoi vers Formspree en arrière-plan.
// Sans JavaScript, le formulaire est envoyé normalement (redirection Formspree).
const formulaire = document.querySelector(".formulaire");
if (formulaire) {
  const statut = formulaire.querySelector(".formulaire-statut");
  const bouton = formulaire.querySelector("button[type=submit]");

  const afficher = (message, type) => {
    statut.textContent = message;
    statut.className = "formulaire-statut " + type;
  };

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();

    // Adresse non injectée par nginx (serveur de dev sans .env, par exemple)
    if (!formulaire.action.startsWith("https://formspree.io/")) {
      afficher(traduire({ fr: "Le formulaire n'est pas encore configuré. Réessayez plus tard.", en: "The form is not configured yet. Please try again later." }), "erreur");
      return;
    }

    bouton.disabled = true;
    afficher(traduire({ fr: "Transmission en cours…", en: "Sending…" }), "");

    try {
      const reponse = await fetch(formulaire.action, {
        method: "POST",
        body: new FormData(formulaire),
        headers: { Accept: "application/json" },
      });

      if (reponse.ok) {
        formulaire.reset();
        afficher(traduire({ fr: "Message envoyé ! Je vous réponds dès que possible.", en: "Message sent! I will get back to you as soon as possible." }), "ok");
      } else {
        afficher(traduire({ fr: "L'envoi a échoué. Vérifiez les champs et réessayez.", en: "Sending failed. Please check the fields and try again." }), "erreur");
      }
    } catch {
      afficher(traduire({ fr: "Connexion impossible. Réessayez dans un instant.", en: "Unable to connect. Please try again in a moment." }), "erreur");
    } finally {
      bouton.disabled = false;
    }
  });
}

// --------------------------------------------------------------------------
// Easter egg : faux terminal caché, ouvert par la touche T ou 7 / è / ` (même
// touche sur un clavier AZERTY). Rien n'existe dans la page avant l'appui.
// --------------------------------------------------------------------------
(() => {
  const INVITE = "jb@caignec:~$";
  const net = (texte) => texte.replace(/\s+/g, " ").trim();

  // Tous les textes du terminal, dans les deux langues du site
  const T = traduire({
    fr: {
      // Les fichiers reprennent le contenu des sections de la page.
      fichiers: {
        "motivation.txt": "profil",
        "formation.txt": "formation",
        "experience.txt": "experience",
        "competences.txt": "competences",
        "langues.txt": "langues",
        "contact.txt": "contact",
      },
      formulaireEnBas: "Le formulaire se trouve tout en bas de la page.",
      age: /(\d+) ans/,
      ans: " ans",
      hote: "Hôte : Lycée Likès, Quimper",
      inconnu: "inconnu",
      paquets: "Paquets : ",
      aide: [
        "Commandes disponibles :",
        "  help            affiche cette aide",
        "  whoami          qui est derrière ce portfolio ?",
        "  ls              liste les fichiers",
        "  cat <fichier>   affiche le contenu d'un fichier",
        "  rm <fichier>    supprime un fichier (et la section de la page)",
        "  fastfetch       informations sur le système",
        "  clear           efface l'écran",
        "  shutdown        ferme le terminal (poweroff, exit... marchent aussi)",
      ],
      redemarrer: "Appuyez sur une touche pour redémarrer.",
      suppression: (nom) => "rm: suppression de '" + nom + "'",
      operandeManquant: (cmd) => cmd + " : opérande manquant",
      introuvable: (cmd, nom) => cmd + ": " + nom + ": Aucun fichier ou dossier de ce nom",
      dossier: (nom) => "rm: impossible de supprimer '" + nom + "': est un dossier",
      impossible: (nom) => "rm: impossible de supprimer '" + nom + "': Aucun fichier ou dossier de ce nom",
      wheel: "Vous n'êtes pas dans le groupe wheel. Cet incident sera signalé.",
      arret: "Arrêt du système...",
      commandeIntrouvable: (cmd) => "bash: " + cmd + " : commande introuvable",
      fermer: "Fermer le terminal",
      commande: "Commande",
      bienvenue: "Bienvenue sur le terminal de Jean-Baptiste. Tapez help pour voir les commandes.",
    },
    en: {
      fichiers: {
        "motivation.txt": "profil",
        "education.txt": "formation",
        "experience.txt": "experience",
        "skills.txt": "competences",
        "languages.txt": "langues",
        "contact.txt": "contact",
      },
      formulaireEnBas: "The form is at the very bottom of the page.",
      age: /(\d+) years old/,
      ans: " years",
      hote: "Host : Lycée Likès, Quimper",
      inconnu: "unknown",
      paquets: "Packages : ",
      aide: [
        "Available commands:",
        "  help            show this help",
        "  whoami          who is behind this portfolio?",
        "  ls              list files",
        "  cat <file>      print a file",
        "  rm <file>       delete a file (and the matching section of the page)",
        "  fastfetch       system information",
        "  clear           clear the screen",
        "  shutdown        close the terminal (poweroff, exit... work too)",
      ],
      redemarrer: "Press any key to reboot.",
      suppression: (nom) => "removed '" + nom + "'",
      operandeManquant: (cmd) => cmd + ": missing operand",
      introuvable: (cmd, nom) => cmd + ": " + nom + ": No such file or directory",
      dossier: (nom) => "rm: cannot remove '" + nom + "': Is a directory",
      impossible: (nom) => "rm: cannot remove '" + nom + "': No such file or directory",
      wheel: "You are not in the wheel group. This incident will be reported.",
      arret: "System is going down...",
      commandeIntrouvable: (cmd) => "bash: " + cmd + ": command not found",
      fermer: "Close the terminal",
      commande: "Command",
      bienvenue: "Welcome to Jean-Baptiste's terminal. Type help to see the commands.",
    },
  });

  const FICHIERS = T.fichiers;

  const lireSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return "";
    const lignes = [];
    section.querySelectorAll(":scope > p, :scope > ul > li").forEach((el) => {
      if (el.tagName === "P") {
        lignes.push(net(el.textContent));
        return;
      }
      const titre = el.querySelector("h3");
      const entete = el.querySelector(".langue-entete");
      if (titre) {
        const lieu = el.querySelector("p");
        const date = el.querySelector(".puce");
        lignes.push("- " + net(titre.textContent) + (lieu ? " : " + net(lieu.textContent) : "") + (date ? " (" + net(date.textContent) + ")" : ""));
      } else if (entete) {
        const [langue, niveau] = [...entete.children].map((s) => net(s.textContent));
        const jauge = [...el.querySelectorAll(".jauge i")].map((i) => (i.classList.contains("plein") ? "■" : "□")).join("");
        lignes.push("- " + langue.padEnd(10) + niveau.padEnd(4) + jauge);
      } else {
        lignes.push("- " + net(el.textContent));
      }
    });
    if (id === "contact") lignes.push(T.formulaireEnBas);
    return lignes.join("\n");
  };

  const LOGO = [
    "     _ ____   ____ ",
    "    | | __ ) / ___|",
    " _  | |  _ \\| |    ",
    "| |_| | |_) | |___ ",
    " \\___/|____/ \\____|",
  ];

  const fastfetch = () => {
    const age = (document.getElementById("profil")?.textContent.match(T.age) || [])[1];
    const infos = [
      "jb@caignec",
      "----------",
      "OS : CIEL Linux (Bac Pro)",
      T.hote,
      "Uptime : " + (age ? age + T.ans : T.inconnu),
      "Shell : jbsh",
      T.paquets + Object.keys(FICHIERS).length + " (ls)",
    ];
    const bloc = document.createElement("span");
    bloc.className = "ascii";
    infos.forEach((info, i) => {
      const logo = document.createElement("span");
      logo.className = "logo-ascii";
      logo.textContent = (LOGO[i] || "").padEnd(LOGO[0].length + 4);
      bloc.append(logo, info + "\n");
    });
    return bloc;
  };

  const AIDE = T.aide.join("\n");

  const FERMETURE = ["shutdown", "poweroff", "halt", "reboot", "exit", "logout"];
  const COMMANDES = ["help", "whoami", "ls", "cat", "rm", "fastfetch", "clear", "su", "sudo", ...FERMETURE];

  let voile, corps, sortie, saisie;
  let focusPrecedent = null;
  const historique = [];
  let position = 0;

  const ecrire = (contenu, classe) => {
    const ligne = document.createElement("div");
    if (classe) ligne.className = classe;
    ligne.append(contenu);
    sortie.append(ligne);
    corps.scrollTop = corps.scrollHeight;
  };

  const fermer = () => {
    saisie.blur();
    voile.hidden = true;
    if (focusPrecedent && focusPrecedent.focus) focusPrecedent.focus();
  };

  // Accepte le nom avec ou sans « .txt »
  const trouverFichier = (nom) => (FICHIERS[nom] ? nom : FICHIERS[nom + ".txt"] ? nom + ".txt" : null);

  // rm : la section disparaît de la page (et son lien du menu) jusqu'au
  // rechargement
  const supprimer = (fichier) => {
    const id = FICHIERS[fichier];
    delete FICHIERS[fichier];
    document.getElementById(id)?.remove();
    document.querySelectorAll('a[href="#' + id + '"]').forEach((lien) => lien.remove());
  };

  // rm -rf / : tout disparaît, puis faux kernel panic. Une touche ou un clic
  // recharge la page.
  const PANIQUE = [
    "[   13.371337] systemd[1]: Caught <SEGV>, core dump failed (child 1, code=killed, status=11/SEGV).",
    "[   13.371402] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000b00",
    "[   13.371455] CPU: 0 PID: 1 Comm: systemd Not tainted 6.6.6-ciel #1",
    "[   13.371489] Hardware name: Lycée Likès CIEL, BIOS 2026",
    "[   13.371502] Call Trace:",
    "[   13.371510]  <TASK>",
    "[   13.371522]  dump_stack_lvl+0x48/0x70",
    "[   13.371537]  panic+0x1a6/0x370",
    "[   13.371549]  do_exit.cold+0x15/0x15",
    "[   13.371561]  </TASK>",
    "[   13.371602] ---[ end Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000b00 ]---",
    "",
    T.redemarrer,
  ].join("\n");

  const paniquer = () => {
    const ecran = document.createElement("pre");
    ecran.className = "ecran-panique";
    ecran.setAttribute("role", "alert");
    ecran.textContent = PANIQUE;
    document.body.append(ecran);
    document.documentElement.classList.add("panique");
    const redemarrer = () => window.location.reload();
    setTimeout(() => {
      document.addEventListener("keydown", redemarrer);
      document.addEventListener("click", redemarrer);
    }, 500);
  };

  const toutSupprimer = () => {
    saisie.disabled = true;
    const etapes = ["/bin", "/boot", "/etc", "/home/jb", "/usr", "/var", ...Object.keys(FICHIERS)];
    let i = 0;
    const suivant = () => {
      if (i < etapes.length) {
        const etape = etapes[i++];
        if (FICHIERS[etape]) supprimer(etape);
        ecrire(T.suppression(etape));
        setTimeout(suivant, mouvementReduit ? 0 : 120);
      } else {
        setTimeout(paniquer, mouvementReduit ? 0 : 400);
      }
    };
    suivant();
  };

  // Recopie la ligne tapée derrière l'invite, comme un vrai terminal
  const recopier = (ligne) => {
    const invite = document.createElement("span");
    invite.className = "terminal-invite";
    invite.textContent = INVITE;
    const echo = document.createDocumentFragment();
    echo.append(invite, " " + ligne);
    ecrire(echo);
  };

  const executer = (ligne) => {
    recopier(ligne);

    const [commande, ...args] = ligne.trim().split(/\s+/);
    if (!commande) return;

    if (commande === "help") {
      ecrire(AIDE);
    } else if (commande === "whoami") {
      ecrire("Jean-Baptiste Caignec");
    } else if (commande === "ls") {
      const liste = document.createElement("span");
      liste.className = "fichier";
      liste.textContent = Object.keys(FICHIERS).join("  ");
      ecrire(liste);
    } else if (commande === "cat") {
      if (!args.length) ecrire(T.operandeManquant("cat"), "erreur-cmd");
      args.forEach((nom) => {
        const fichier = trouverFichier(nom);
        if (fichier) ecrire(lireSection(FICHIERS[fichier]));
        else ecrire(T.introuvable("cat", nom), "erreur-cmd");
      });
    } else if (commande === "rm") {
      const options = args.filter((a) => a.startsWith("-")).join("");
      const cibles = args.filter((a) => !a.startsWith("-"));
      if (cibles.some((c) => c === "/" || c === "/*") && /r/i.test(options)) {
        toutSupprimer();
        return;
      }
      if (!cibles.length) ecrire(T.operandeManquant("rm"), "erreur-cmd");
      cibles.forEach((nom) => {
        const fichiers = nom === "*" || nom === "*.txt" ? Object.keys(FICHIERS) : [trouverFichier(nom)];
        if (fichiers[0]) fichiers.forEach(supprimer);
        else if (nom === "/" || nom === "/*") ecrire(T.dossier(nom), "erreur-cmd");
        else ecrire(T.impossible(nom), "erreur-cmd");
      });
    } else if (commande === "fastfetch" || commande === "neofetch") {
      ecrire(fastfetch());
    } else if (commande === "clear") {
      sortie.textContent = "";
    } else if (commande === "su" || commande === "sudo") {
      ecrire(T.wheel, "erreur-cmd");
    } else if (FERMETURE.includes(commande)) {
      ecrire(T.arret);
      saisie.disabled = true;
      setTimeout(fermer, mouvementReduit ? 0 : 600);
    } else {
      ecrire(T.commandeIntrouvable(commande), "erreur-cmd");
    }
  };

  // Complétion avec Tab : commandes en premier mot, fichiers ensuite
  const completer = () => {
    const mots = saisie.value.split(" ");
    const dernier = mots[mots.length - 1];
    const choix = mots.length === 1 ? COMMANDES : Object.keys(FICHIERS);
    const trouves = choix.filter((c) => c.startsWith(dernier));
    if (trouves.length === 1) {
      mots[mots.length - 1] = trouves[0];
      saisie.value = mots.join(" ") + (mots.length === 1 ? " " : "");
    } else if (trouves.length > 1 && dernier) {
      recopier(saisie.value);
      ecrire(trouves.join("  "));
    }
  };

  const construire = () => {
    voile = document.createElement("div");
    voile.className = "terminal-voile";
    voile.hidden = true;

    const terminal = document.createElement("div");
    terminal.className = "terminal";
    terminal.setAttribute("role", "dialog");
    terminal.setAttribute("aria-modal", "true");
    terminal.setAttribute("aria-label", "Terminal");

    const barre = document.createElement("div");
    barre.className = "terminal-barre";
    const titre = document.createElement("em");
    titre.textContent = "jb@caignec : ~";
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "terminal-fermer";
    bouton.setAttribute("aria-label", T.fermer);
    bouton.textContent = "×";
    bouton.addEventListener("click", fermer);
    barre.append(document.createElement("span"), document.createElement("span"), document.createElement("span"), titre, bouton);

    corps = document.createElement("div");
    corps.className = "terminal-corps";
    sortie = document.createElement("div");
    sortie.className = "terminal-sortie";
    sortie.setAttribute("aria-live", "polite");

    const ligne = document.createElement("label");
    ligne.className = "terminal-ligne";
    const invite = document.createElement("span");
    invite.className = "terminal-invite";
    invite.textContent = INVITE;
    saisie = document.createElement("input");
    saisie.type = "text";
    saisie.autocomplete = "off";
    saisie.spellcheck = false;
    saisie.setAttribute("autocapitalize", "off");
    saisie.setAttribute("aria-label", T.commande);
    ligne.append(invite, saisie);

    corps.append(sortie, ligne);
    terminal.append(barre, corps);
    voile.append(terminal);
    document.body.append(voile);

    saisie.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const valeur = saisie.value;
        if (valeur.trim()) historique.push(valeur);
        position = historique.length;
        saisie.value = "";
        executer(valeur);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        position = Math.max(0, Math.min(historique.length, position + (e.key === "ArrowUp" ? -1 : 1)));
        saisie.value = historique[position] || "";
      } else if (e.key === "Tab") {
        e.preventDefault();
        completer();
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        sortie.textContent = "";
      }
    });

    voile.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fermer();
    });
    voile.addEventListener("click", (e) => {
      if (e.target === voile) fermer();
    });
    corps.addEventListener("click", () => {
      if (!String(window.getSelection())) saisie.focus();
    });
  };

  const ouvrir = () => {
    if (!voile) construire();
    focusPrecedent = document.activeElement;
    sortie.textContent = "";
    ecrire(T.bienvenue);
    saisie.disabled = false;
    saisie.value = "";
    position = historique.length;
    voile.hidden = false;
    saisie.focus();
  };

  document.addEventListener("keydown", (e) => {
    // AltGr compte comme Ctrl+Alt sous Windows : seul Ctrl (ou Cmd) annule.
    if (e.defaultPrevented || e.metaKey || (e.ctrlKey && !e.altKey)) return;
    const touche = ["7", "è", "`", "t", "T"].includes(e.key) || (e.key === "Dead" && e.code === "Digit7");
    if (!touche || (voile && !voile.hidden)) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    ouvrir();
  });
})();
