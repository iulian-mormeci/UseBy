# UseBy

Servizio self-hosted per la gestione di dispensa, frigo e congelatore: tracciamento
prodotti e scadenze, ricerca ricette in base a quello che hai in casa, segnalazione
via email dei prodotti mancanti a catalogo.

Tutta la logica (matching prodotti, ricerca ricette) è basata su query al database
e regole esplicite: nessuna integrazione con modelli AI/LLM in nessuna parte del
progetto.

## Stack

- [Next.js 15](https://nextjs.org/) (TypeScript, App Router)
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- Docker Compose per il deploy (container `app`, `db`, `mailhog` in dev)

## Sviluppo locale

Requisiti: Node.js 22+, Docker.

```bash
cp .env.example .env   # se non già presente
npm install

# avvia solo db + mailhog in Docker
docker compose --profile dev up -d db mailhog

# applica lo schema al database e genera il client Prisma
npm run prisma:migrate:dev
npm run prisma:generate

npm run dev
```

- App: http://localhost:3000
- Mailhog (catcher email di sviluppo): http://localhost:8025

## Deploy con Docker Compose

Stack completo (app + db), con Mailhog opzionale via profilo `dev`:

```bash
# produzione: senza mailhog, SMTP reale configurato in .env
docker compose up -d --build

# sviluppo/staging: con mailhog incluso
docker compose --profile dev up -d --build
```

Al primo avvio il container `app` esegue automaticamente `prisma migrate deploy`
prima di partire (vedi `docker-entrypoint.sh`).

## Variabili d'ambiente

Vedi `.env.example` per l'elenco completo (credenziali Postgres, `DATABASE_URL`,
porta dell'app, configurazione SMTP per le email di segnalazione prodotti mancanti,
`REPORT_EMAIL_TO` come destinatario di quelle email).
In produzione, valorizzare `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD` con
un relay SMTP reale e omettere il profilo `dev` (Mailhog) in fase di avvio.

`SMTP_HOST` dipende da come stai eseguendo l'app: `localhost` per `npm run dev`
sull'host (Mailhog pubblica la porta 1025), `mailhog` se usi il profilo `dev` di
docker-compose (rete interna dei container), il relay reale in produzione.
