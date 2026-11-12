# Portfolio de JBC

Ceci est le code-source du portfolio de mon ami et contributeur **Jean-Baptiste**, publié sur [caignec.eu](https://caignec.eu).

Site statique (HTML, CSS, JavaScript sans dépendance) servi par nginx dans Docker, et exposé sur Internet par un tunnel [FRP](https://github.com/fatedier/frp).

## Déploiement

```sh
git clone https://github.com/raph-dot-img/portfolio_de_jb.git
cd portfolio_de_jb
cp .env.example .env   # puis remplir les valeurs (FRP + Formspree)
docker compose up -d
```

- Le site répond en local sur `http://127.0.0.1:45888`.
- `frpc` relaie le trafic en TCP vers le serveur FRP. Le HTTPS est géré en amont par Nginx Reverse Proxy, qui doit pointer `caignec.eu` (et `*.caignec.eu`) vers `FRP_SERVER_REMOTE_PORT` et transmettre l'en-tête `X-Forwarded-For`.
- Le journal d'accès est conservé dans `logs/acces.log`.

Après une modification d'un fichier du site : `docker compose restart portfolio` (les fichiers sont montés un par un, et beaucoup d'éditeurs remplacent le fichier au lieu de le modifier, ce que le conteneur ne voit pas).

## Développement

```sh
python3 serve.py        # http://localhost:8080
```

Serveur de développement uniquement : il reproduit les pages d'erreur, la page 418 et l'injection de l'adresse Formspree (lue dans `.env`), mais n'est pas fait pour la production.

## Licences

- **Le code est sous licence [MIT](LICENSE)** : vous pouvez le réutiliser, le modifier et le redistribuer librement, en gardant la mention de copyright.
- **Le contenu personnel de Jean-Baptiste en est exclu** et reste tous droits réservés : CV, textes qui le présentent, politique de confidentialité, nom, coordonnées, logo. Ce sont en bonne partie des données personnelles : merci de ne pas les réutiliser. Si vous reprenez le code, remplacez tout ce contenu par le vôtre. Le détail est dans [NOTICE](NOTICE).
- Les composants tiers gardent leurs propres licences : polices sous SIL Open Font License (voir [THIRD_PARTY_NOTICE.md](THIRD_PARTY_NOTICE.md)), GIF du chat, logiciels de déploiement. Tout est récapitulé sur la page [CGU.html](CGU.html).
