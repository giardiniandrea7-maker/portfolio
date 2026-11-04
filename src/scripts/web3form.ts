// Invio dei form [data-web3form] a Web3Forms con validazione HTML5,
// regola "almeno uno tra" e stati invio / conferma / errore.

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

function checkRequireOne(form: HTMLFormElement): boolean {
  const names = (form.dataset.requireOne ?? '').split(',').filter(Boolean);
  if (names.length === 0) return true;

  const fields = names
    .map((n) => form.elements.namedItem(n))
    .filter((f): f is HTMLInputElement => f instanceof HTMLInputElement);
  const ok = fields.some((f) => f.value.trim() !== '');
  const message = form.dataset.requireOneMessage ?? '';

  fields.forEach((f) => f.setCustomValidity(ok ? '' : message));
  const hint = form.querySelector<HTMLElement>('[data-require-one-error]');
  if (hint) hint.hidden = ok;
  return ok;
}

function initForm(form: HTMLFormElement) {
  const root = form.closest<HTMLElement>('[data-web3form-root]');
  const btn = form.querySelector<HTMLButtonElement>('[data-form-submit]');
  const errorBox = form.querySelector<HTMLElement>('[data-form-error]');
  const success = root?.querySelector<HTMLElement>('[data-form-success]');
  if (!root || !btn || !errorBox || !success) return;

  // Ricalcola la regola "almeno un recapito" mentre l'utente scrive
  (form.dataset.requireOne ?? '')
    .split(',')
    .filter(Boolean)
    .forEach((n) => {
      const f = form.elements.namedItem(n);
      if (f instanceof HTMLInputElement) {
        f.addEventListener('input', () => {
          if (form.dataset.submitted) checkRequireOne(form);
        });
      }
    });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.dataset.submitted = 'true';
    errorBox.hidden = true;

    const oneOk = checkRequireOne(form);
    if (!oneOk || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    // Honeypot compilato: è un bot, fingo un invio riuscito
    if (data.get('botcheck')) {
      form.hidden = true;
      success.hidden = false;
      return;
    }

    const body: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string' && key !== 'botcheck') body[key] = value;
    }

    btn.disabled = true;
    btn.textContent = 'Invio in corso…';

    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      errorBox.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = btn.dataset.label ?? '';
    }
  });
}

export function initWeb3Forms() {
  document.querySelectorAll<HTMLFormElement>('form[data-web3form]').forEach((form) => {
    if (form.dataset.ready) return;
    form.dataset.ready = 'true';
    initForm(form);
  });
}
