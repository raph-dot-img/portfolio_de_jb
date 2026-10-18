# CLAUDE.md

Notes pour les futures sessions de Claude Code sur ce dépôt.

## Le projet

Portfolio de Jean-Baptiste Caignec (élève en Bac Pro CIEL), publié sur https://caignec.eu.
Le contenu vient de son CV : `assets/CV_Jean-Baptiste_CAIGNEC.pdf` (en français uniquement).

- Site statique, une seule page : `index.html`, `style.css`, `script.js`. Aucun framework, aucun build.
- Deux langues, une seule servie par déploiement : `WEB_UI_LANGUAGE=fr|en` dans le `.env`, **anglais par défaut** (valeur absente ou invalide comprise). Les pages HTML existent en double dans `fr/` et `en/` (`index.html`, `confidentialite.html`, `CGU.html`, `erreurs/`), aux mêmes noms de fichiers et donc aux mêmes URL. `style.css`, `script.js` et `assets/` sont communs. **Toute modification de texte se fait dans les deux langues.**
- `script.js` choisit ses textes (formulaire, terminal) d'après `<html lang>` : `fr`, sinon anglais.
- Style « cyberpunk » léger : fond sombre quadrillé, jaune néon `#ffe81a` (couleur du favicon), cyan `#00f0ff`, magenta `#ff2a6d` pour les accents. Variables CSS dans `:root`. Rester sobre : pas d'effet lourd.
- Polices auto-hébergées : Orbitron (titres, variable 400-900) et Space Mono (texte, 400 seulement) dans `assets/polices/`, sous licence OFL.
- Le logo `assets/logo_nobg.svg` (lettres noires) est utilisé comme masque CSS (`.logo`) et coloré en jaune.
- Noms de classes, d'id et commentaires en français.
- Easter egg : faux terminal caché (`script.js`), ouvert par la touche 7 / è / ` ou T hors des champs de saisie. `rm` retire une section jusqu'au rechargement, `rm -rf /` affiche un faux kernel panic. Ses fichiers `cat` relisent le texte des sections de `index.html` : rien à mettre à jour en double (les noms des fichiers, eux, sont traduits dans `script.js`).

## Contraintes à respecter

- **Aucune ressource externe** (police, CDN, analytics...) : la CSP de `nginx/securite.conf` n'autorise que `'self'`, plus `https://formspree.io` pour le formulaire. Pas de style ou de script inline (attributs `style=""` compris) : ils seraient bloqués.
- Le site doit fonctionner sans JavaScript (le formulaire se replie sur un envoi classique).
- Le texte de `fr/confidentialite.html` est fourni par le propriétaire du dépôt : n'en changer le fond qu'à sa demande. `en/confidentialite.html` en est une traduction fidèle, à garder alignée.
- Le site vouvoie le visiteur (formulaire, messages du script).
- Ne jamais versionner `.env` (seul `.env.example` l'est).

## Infrastructure

- `docker-compose.yml` : `portfolio` (nginx:alpine) + `frpc` (tunnel TCP vers le serveur FRP). Le HTTPS est terminé par Nginx Reverse Proxy sur le serveur distant.
- `nginx/default.conf` est monté comme **modèle** (`/etc/nginx/templates/`) : l'image nginx y remplace `${FORMSPREE_ENDPOINT}` et `${WEB_UI_LANGUAGE}` au démarrage (filtre `NGINX_ENVSUBST_FILTER`). nginx remplace ensuite `__FORMSPREE_ENDPOINT__` dans `index.html` via `sub_filter`.
- Langue : un `map` de `nginx/default.conf` donne `$langue` (`fr`, sinon `en`). `fr/` et `en/` sont montés dans `/usr/share/nginx/pages/`, et les pages traduites et `/erreurs/` y prennent leur `root`. Le reste est servi depuis `/usr/share/nginx/html`.
- La vraie IP du visiteur vient de `X-Forwarded-For` (module realip, adresses privées de confiance).
- Les fichiers communs du site sont montés un par un. **Tout nouveau fichier public commun** doit être ajouté dans les volumes de `docker-compose.yml` ET dans `RACINES_PUBLIQUES` de `serve.py`. **Toute nouvelle page traduite** se crée dans `fr/` et `en/`, puis s'ajoute à la regex des pages traduites de `nginx/default.conf` ET à `PAGES_TRADUITES` de `serve.py`, et si besoin dans `sitemap.xml`.
- Le journal d'accès (`logs/acces.log`) contient les IP des visiteurs : à garder en tête pour la politique de confidentialité.

## Pages d'erreur et piège à scanners

- `fr/erreurs/*.html` et `en/erreurs/*.html` : pages d'erreur personnalisées, servies uniquement en interne par nginx.
- Les chemins sensibles (`/.env`, `/admin`, `/wp-login.php`...) renvoient un **418** avec le chat `assets/smug_cat.gif` et l'IP du client, insérée par SSI (`<!--# echo var="remote_addr" -->`). Le message « incident signalé » est purement dissuasif.
- La liste des chemins existe en double : regex dans `nginx/default.conf` et `CHEMINS_SCANNERS` dans `serve.py`. Les garder identiques.

## Tester

- Dev : `python3 serve.py [port]` (reproduit erreurs, 418 avec IP, injection Formspree et langue depuis `.env` ou l'environnement, ex. `WEB_UI_LANGUAGE=fr python3 serve.py`).
- Prod locale : `cp .env.example .env && docker compose up -d portfolio`, puis http://127.0.0.1:45888. Redémarrer le conteneur après chaque modification (fichiers montés un par un).
- Vérifier la config frpc : `docker run --rm --entrypoint frpc -e ... -v $PWD/frp/frpc.toml:/etc/frp/frpc.toml:ro snowdreamtech/frpc verify -c /etc/frp/frpc.toml`.
- Vérifier le responsive jusqu'à 320 px de large, sans défilement horizontal.

## Licences

Code sous Microsoft Reference Source License, Ms-RSL (`LICENSE`), polices sous OFL (`THIRD_PARTY_NOTICE.md`). `CGU.html` (dans `fr/` et `en/`) reprend les deux textes : à mettre à jour si l'un change ou si un élément tiers est ajouté.
