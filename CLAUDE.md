# CLAUDE.md — cosmaneura-web

> Architecture decisions for this system live in the `cosmaneura-architecture` repo, in `ARCHITECTURE.md`. Read it before making structural changes. If a change conflicts with it, stop and resolve the conflict rather than proceeding.

## Qué es

El sitio de marketing de **cosmaneura.com**, migrado de Squarespace a **Cloudflare Pages**.
HTML/CSS estático sin build step, más dos Cloudflare Pages Functions que manejan la
suscripción de $89/mes vía la **REST API de Stripe** (sin SDK, para correr en el runtime
de Workers sin build).

Por `ARCHITECTURE.md` §4 este repo es una **superficie host**: hospeda los montajes
públicos del chatbot (free anónimo → intake → concierge del paciente inscrito) vía el
embed contract. **No posee estado PHI ni lógica de chatbot.** Hoy los montajes todavía
no existen — es el paso 5 del build order.

## Estructura

```
index.html          la landing page
styles.css          todo el styling (light + dark vía prefers-color-scheme)
success.html        retorno post-checkout de Stripe
favicon.svg         marca pulse-cross
functions/api/
  checkout.js       POST/GET /api/checkout — crea la Checkout Session
  webhook.js        POST /api/webhook — recibe eventos de Stripe
.dev.vars.example   plantilla de env local
```

## Comandos

```bash
npx serve .        # preview local; no hay build step
```

Deploy: Cloudflare Pages, **build command vacío**, output directory = raíz (`/`).

## Config

Secrets en Cloudflare Pages → Settings → Variables and Secrets:
`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.
Sin ellos, `/api/checkout` responde 503 limpio en vez de fallar.

Colores de marca: blue `#2F7DC4`, navy `#16234E`, coral `#E4788D`. El wordmark usa
un stack sustituto (`Futura`/`Century Gothic`) — la tipografía final está pendiente.

## Notas

- ⚠️ **Un suscriptor que paga hoy solo queda registrado como `console.log`** en
  `webhook.js`. Es un paso interino conocido (el README lo dice: la Fase 1 da acceso
  manual), pero los logs de Workers no son durables ni consultables. Stripe retiene el
  pago, así que es reconciliable a mano — no dinero perdido. Persistirlo en KV o D1 es
  el arreglo de menor esfuerzo y mayor urgencia del repo.
- Email de suscriptor en logs sin política de retención declarada. Cae bajo el régimen
  de *prospect* de §10 (política de privacidad propia de CosmaNeura, no HIPAA).
- Pendientes no-código en el README: cutover de DNS **preservando los registros MX de
  Google Workspace** (4 buzones), transferir el billing de Workspace fuera de
  Squarespace, y cancelar Squarespace antes de su renovación ~2026-08-05.
