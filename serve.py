#!/usr/bin/env python3

# !! USAGE DE L'IA DANS CE FICHIER !!

"""Petit serveur de développement pour voir le site sans Docker. Pas pour la prod !

Il reproduit ce que fait nginx en production :
- pages d'erreur personnalisées de fr/erreurs/ ou en/erreurs/ ;
- 418 + chat smug sur les chemins que visent les scanners, avec l'IP du client ;
- adresse Formspree injectée dans index.html depuis le fichier .env (si présent) ;
- pages dans la langue de WEB_UI_LANGUAGE (fr ou en, anglais par défaut) ;
- seuls les fichiers publics du site sont servis.

Usage : python3 serve.py [port]
"""

import html
import os
import re
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

RACINE = Path(__file__).resolve().parent

# Mêmes chemins que le bloc « scanners » de nginx/default.conf : les deux
# listes doivent rester identiques, sinon l'easter egg ne se voit qu'en Docker.
CHEMINS_SCANNERS = re.compile(
    r"^/(?:admin|administrator|wp-admin|wp-login\.php|cpanel|panel|manage|management"
    r"|backend|dashboard|\.env|config\.php|config\.json|wp-config\.php|\.git|\.aws"
    r"|database\.yml|wp-content|wp-includes|xmlrpc\.php|joomla|drupal|typo3|laravel"
    r"|phpinfo\.php|info\.php|server-status|server-info|debug|test\.php|actuator"
    r"|phpmyadmin|pma|adminer\.php|dbadmin|\.ssh|backup\.(?:sql|zip)|\.htpasswd"
    r"|\.htaccess|api|graphql|swagger|docker-compose\.ya?ml|\.docker|frpc?\.toml"
    r"|serve\.py|nginx|frp|logs)(?:[/.-]|$)",
    re.IGNORECASE,
)

# Balise SSI que nginx remplace par l'IP du client dans erreurs/418.html (fr/ et en/)
BALISE_IP = re.compile(r"<!--#\s*echo\s+var=\"remote_addr\"[^>]*-->")

# Même principe que les volumes de docker-compose.yml : seuls les fichiers
# destinés au site sont servis. Sans cette liste, le serveur de développement
# exposerait tout le dépôt (docker-compose.yml, CLAUDE.md, nginx/, frp/...),
# ce que Docker ne fait pas. Toute nouvelle page se déclare ici et là-bas.
RACINES_PUBLIQUES = {
    "LICENSE",
    "style.css",
    "script.js",
    "robots.txt",
    "sitemap.xml",
    "assets",
}

# Pages traduites, servies depuis fr/ ou en/ selon WEB_UI_LANGUAGE (comme les
# locations de nginx/default.conf qui pointent vers /usr/share/nginx/pages/).
PAGES_TRADUITES = {"index.html", "confidentialite.html", "CGU.html"}
LANGUES = {"fr", "en"}


def lire_env(nom):
    """Variable depuis l'environnement, sinon depuis le fichier .env."""
    valeur = os.environ.get(nom)
    fichier = RACINE / ".env"
    if not valeur and fichier.is_file():
        for ligne in fichier.read_text(encoding="utf-8").splitlines():
            cle, _, reste = ligne.partition("=")
            if cle.strip() == nom:
                valeur = reste.strip().strip("\"'")
    return valeur


FORMSPREE = lire_env("FORMSPREE_ENDPOINT") or "__FORMSPREE_ENDPOINT__"

# Comme le « map » de nginx/default.conf : toute autre valeur donne l'anglais.
LANGUE = (lire_env("WEB_UI_LANGUAGE") or "").strip().lower()
if LANGUE not in LANGUES:
    LANGUE = "en"
DOSSIER_PAGES = RACINE / LANGUE
DOSSIER_ERREURS = DOSSIER_PAGES / "erreurs"


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
    }

    def chemin(self):
        return self.path.split("?", 1)[0].split("#", 1)[0]

    def guess_type(self, path):
        if Path(path).name == "LICENSE":
            return "text/plain; charset=utf-8"
        return super().guess_type(path)

    def send_head(self):
        chemin = self.chemin()
        if CHEMINS_SCANNERS.match(chemin):
            self.send_error(418)
            return None

        if chemin in ("/", "/index.html"):
            corps = (DOSSIER_PAGES / "index.html").read_text(encoding="utf-8")
            corps = corps.replace("__FORMSPREE_ENDPOINT__", FORMSPREE).encode("utf-8")
            self.envoyer(200, corps)
            return None

        # Les pages d'erreur (fr/erreurs/, en/erreurs/) ne s'ouvrent jamais
        # directement, comme avec le « internal » de nginx.
        page = chemin.lstrip("/")
        if page in PAGES_TRADUITES:
            self.envoyer(200, (DOSSIER_PAGES / page).read_bytes())
            return None

        premier = page.split("/", 1)[0]
        if premier and premier not in RACINES_PUBLIQUES:
            self.send_error(404)
            return None

        return super().send_head()

    def list_directory(self, path):
        """nginx ne liste aucun dossier (« try_files ... =404 ») : idem ici."""
        self.send_error(404)
        return None

    def envoyer(self, code, corps, message=None):
        self.send_response(code, message)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(corps)

    def send_error(self, code, message=None, explain=None):
        page = DOSSIER_ERREURS / f"{code}.html"
        if not page.is_file():
            return super().send_error(code, message, explain)

        texte = page.read_text(encoding="utf-8")
        texte = BALISE_IP.sub(html.escape(self.client_address[0]), texte)
        self.close_connection = True
        self.envoyer(code, texte.encode("utf-8"), message)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = partial(Handler, directory=str(RACINE))
    serveur = HTTPServer(("127.0.0.1", port), handler)
    print(f"Site disponible sur http://localhost:{port} (langue : {LANGUE})")
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")


if __name__ == "__main__":
    main()
