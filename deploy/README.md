# Self-hosting openkerk

The site runs as two Docker containers: the Flask app (built from the repo's
`Dockerfile`) and [Caddy](https://caddyserver.com) in front of it. Caddy
handles HTTPS: it gets a free Let's Encrypt certificate for your domain on
first start, renews it automatically, and redirects HTTP to HTTPS.

`update.sh` keeps the server in sync with GitHub. Run from cron, it checks
`main` every few minutes and, when there's a new commit, rebuilds and
restarts the site. If the new version doesn't come up healthy, it rolls back
to the previous one and won't retry that commit.

## Requirements

- A Linux server (Ubuntu/Debian) with a public IP.
- Ports **80** and **443** open (TCP, plus UDP 443 for HTTP/3).
- [Docker Engine with the Compose plugin](https://docs.docker.com/engine/install/).
- DNS: an `A` record (and `AAAA` for IPv6) for your domain pointing at the
  server. Set this up first. Caddy can't get a certificate until it does.

## Setup

All commands run as root (`sudo -i`).

**1. Clone the repo:**

```bash
git clone https://github.com/Open-Kerk/openkerk.git /opt/openkerk
```

**2. Fill in the settings:**

```bash
cp /opt/openkerk/deploy/.env.example /opt/openkerk/deploy/.env
nano /opt/openkerk/deploy/.env   # DOMAIN and ACME_EMAIL; SECRET_KEY is generated on first run
```

**3. Start the site:**

```bash
/opt/openkerk/deploy/update.sh --force
```

The first run takes a minute or two to build. Open `https://<your domain>`.
The certificate is usually issued within seconds of the first visit.

**4. Keep it updated from cron:**

```bash
crontab -e
```

Add:

```cron
*/5 * * * * /opt/openkerk/deploy/update.sh >> /var/log/openkerk-update.log 2>&1
```

The log only gets a line when something is deployed (or fails).

## Day to day

| What | Command |
| --- | --- |
| Deploy log | `tail -f /var/log/openkerk-update.log` |
| App / Caddy logs | `docker compose -f /opt/openkerk/deploy/docker-compose.yml logs -f` |
| Redeploy now | `/opt/openkerk/deploy/update.sh --force` |
| Stop the site | `docker compose -f /opt/openkerk/deploy/docker-compose.yml down` |

Don't delete the `caddy_data` Docker volume. It holds the certificates and
the Let's Encrypt account. Recreating it too often can hit Let's Encrypt's
rate limits.
