const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

function initServiceForm() {
  const form = document.getElementById('service-form') as HTMLFormElement | null;
  const result = document.getElementById('service-result') as HTMLElement | null;
  const btn = document.getElementById('service-submit') as HTMLButtonElement | null;

  if (!form || !result || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Invio in corso...';
    result.classList.add('hidden');

    const fd = new FormData(form);
    const jsonBody: Record<string, string> = {};
    const fileNames: string[] = [];
    for (const [key, val] of [...fd.entries()]) {
      if (val instanceof File) {
        if (val.size > 0) fileNames.push(val.name);
      } else {
        jsonBody[key] = val as string;
      }
    }
    if (fileNames.length > 0) {
      jsonBody['allegati_indicati'] = fileNames.join(', ');
    }

    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonBody),
      });
      const data = await res.json();

      if (data.success) {
        const fileNote = fileNames.length > 0
          ? ' Per i file allegati, inviali a diagnosi@giardiniconsulenza.it o via WhatsApp.'
          : '';
        result.textContent = 'Richiesta inviata con successo! Ti ricontatteremo il prima possibile.' + fileNote;
        result.className = 'rounded-sm p-4 text-sm font-semibold text-center bg-green-50 text-green-700 border border-green-200';
        form.reset();
      } else {
        showError(result);
      }
    } catch {
      showError(result);
    }

    result.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Invia';
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const result = document.getElementById('contact-result') as HTMLElement | null;
  const btn = document.getElementById('contact-submit') as HTMLButtonElement | null;

  if (!form || !result || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Invio in corso...';
    result.classList.add('hidden');

    const fd = new FormData(form);
    fd.delete('privacy');

    try {
      const res = await fetch(WEB3FORMS_URL, { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success) {
        result.textContent = 'Messaggio inviato con successo! Ti risponderò entro 24 ore lavorative.';
        result.className = 'rounded-sm p-4 text-sm font-semibold text-center bg-green-50 text-green-700 border border-green-200';
        form.reset();
      } else {
        showError(result);
      }
    } catch {
      showError(result);
    }

    result.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = 'Invia messaggio <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  });
}

function showError(el: HTMLElement) {
  el.textContent = 'Si è verificato un errore. Riprova o scrivimi a andrea@giardiniconsulenza.it';
  el.className = 'rounded-sm p-4 text-sm font-semibold text-center bg-red-50 text-red-700 border border-red-200';
}

initServiceForm();
initContactForm();
