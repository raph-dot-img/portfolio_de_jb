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
Ce projet est distribué sous la **Microsoft Reference Source License (Ms-RSL)** : le code peut être consulté, mais pas réutilisé, modifié ni redistribué. Consultez le fichier [LICENSE](LICENSE) pour les détails.
Des licences de composants tiers sont utilisées par le projet (tels que les polices d'écriture). Voir [THIRD_PARTY_NOTICE.md](THIRD_PARTY_NOTICE.md) et la page [CGU.html](CGU.html).
