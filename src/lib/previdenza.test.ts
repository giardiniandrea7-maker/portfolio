import { describe, expect, it } from 'vitest';

import {
  aliquotaUscita,
  calcola,
  fasciaDaLordo,
  stimaLordoAnnuo,
  tassoSostituzione,
  valoreDiIniziareOggi,
  type InputPensione,
} from './previdenza';
import { DEDUCIBILITA_MAX } from '../data/previdenza';

const base: InputPensione = {
  eta: 35,
  tipo: 'privato',
  nettoMese: 2200,
  tenorePct: 85,
  versamentoMese: 150,
  datore: true,
  etaPensione: 67,
  ipotesi: 'prudente',
  reinvestiRimborso: true,
  tfr: false,
  annoCorrente: 2026,
};

const ok = (i: InputPensione) => {
  const e = calcola(i);
  if (!e.ok) throw new Error(JSON.stringify(e.errori));
  return e.risultato;
};

describe('parametri', () => {
  it('interpola i tassi RGS e li limita a 2020–2070', () => {
    expect(tassoSostituzione(2045, 'privato')).toBeCloseTo(61.2);
    expect(tassoSostituzione(1990, 'pubblico')).toBeCloseTo(71.7);
    expect(tassoSostituzione(2100, 'privato')).toBeCloseTo(58.5);
    expect(tassoSostituzione(2070, 'autonomo')).toBeCloseTo(47.2);
  });

  it('stima il lordo e la fascia dal netto', () => {
    expect(fasciaDaLordo(stimaLordoAnnuo(1300))).toBe('fino28');
    expect(fasciaDaLordo(stimaLordoAnnuo(2200))).toBe('da28a50');
    expect(fasciaDaLordo(stimaLordoAnnuo(4000))).toBe('oltre50');
  });

  it('tassazione in uscita: 15% fino a 15 anni, poi scende fino al 9%', () => {
    expect(aliquotaUscita(15)).toBeCloseTo(0.15);
    expect(aliquotaUscita(20)).toBeCloseTo(0.135);
    expect(aliquotaUscita(35)).toBeCloseTo(0.09);
    expect(aliquotaUscita(45)).toBeCloseTo(0.09);
  });
});

describe('calcola', () => {
  it('accetta le età limite 20 e 64, rifiuta 19 e 65', () => {
    expect(calcola({ ...base, eta: 20 }).ok).toBe(true);
    expect(calcola({ ...base, eta: 64 }).ok).toBe(true);
    for (const eta of [19, 65]) {
      const e = calcola({ ...base, eta });
      expect(e.ok).toBe(false);
      if (!e.ok) expect(e.errori.eta).toBeTruthy();
    }
  });

  it('con tenore basso il divario è zero', () => {
    const r = ok({ ...base, tenorePct: 50 });
    expect(r.divario).toBe(0);
    expect(r.obiettivo).toBe(0);
    expect(r.complementare.copertura).toBe(100);
  });

  it('per un autonomo non c’è datore né TFR, anche se richiesti', () => {
    const r = ok({ ...base, tipo: 'autonomo', datore: true, tfr: true });
    expect(r.complementare.datoreAnnuo).toBe(0);
    expect(r.complementare.tfrAnnuo).toBe(0);
    expect(r.complementare.motori.datore).toBe(0);
    expect(r.pensione).toBeLessThan(ok(base).pensione);
  });

  it('il datore privato versa l’1,5% del lordo', () => {
    const r = ok(base);
    expect(r.complementare.datoreAnnuo).toBeCloseTo(r.lordoAnnuo * 0.015);
    expect(ok({ ...base, tipo: 'pubblico' }).complementare.datoreAnnuo).toBe(0);
  });

  it('rimborso fiscale: limite di deducibilità e aliquota della fascia', () => {
    const r = ok({ ...base, datore: false, reinvestiRimborso: false });
    expect(r.complementare.rimborsoAnnuo).toBeCloseTo(1800 * r.aliquota);
    const alto = ok({ ...base, datore: false, versamentoMese: 1000, reinvestiRimborso: false });
    expect(alto.complementare.rimborsoAnnuo).toBeCloseTo(DEDUCIBILITA_MAX * alto.aliquota);
  });

  it('senza reinvestimento i rimborsi restano in tasca; reinvestiti fanno crescere il capitale', () => {
    const senza = ok({ ...base, reinvestiRimborso: false });
    const con = ok({ ...base, reinvestiRimborso: true });
    expect(senza.complementare.motori.rimborso).toBe(0);
    expect(senza.complementare.rimborsoInTasca).toBeCloseTo(senza.complementare.rimborsoAnnuo * senza.anni);
    expect(con.complementare.motori.rimborso).toBeGreaterThan(0);
    expect(con.complementare.capitale).toBeGreaterThan(senza.complementare.capitale);
    // Solo l'ultimo rimborso (dopo la pensione) resta in tasca
    expect(con.complementare.rimborsoInTasca).toBeLessThan(senza.complementare.rimborsoInTasca);
  });

  it('con lo stesso impegno la previdenza complementare supera il risparmio da solo', () => {
    const r = ok(base);
    expect(r.solo.motori.tuo).toBe(r.complementare.motori.tuo);
    expect(r.complementare.capitale).toBeGreaterThan(r.solo.capitale);
    expect(r.solo.tasseUscita).toBe(0);
    expect(r.complementare.aliquotaUscita).toBeCloseTo(0.099); // 32 anni: 15% - 17 x 0,30
  });

  it('la serie parte da zero oggi e arriva al capitale lordo', () => {
    const r = ok(base);
    expect(r.complementare.serie).toHaveLength(r.anni + 1);
    expect(r.complementare.serie[0].totale).toBe(0);
    expect(r.complementare.serie[r.anni].totale).toBeCloseTo(r.complementare.capitaleLordo);
  });

  it('il TFR aumenta il capitale ma il confronto resta a parità di impegno', () => {
    const r = ok({ ...base, tfr: true });
    expect(r.complementare.motori.tfr).toBeGreaterThan(0);
    expect(r.complementareSenzaTfr.motori.tfr).toBe(0);
    expect(r.complementare.capitale).toBeGreaterThan(r.complementareSenzaTfr.capitale);
  });

  it('iniziare oggi vale più che iniziare tra 5 anni', () => {
    expect(valoreDiIniziareOggi(base)).toBeGreaterThan(0);
    expect(valoreDiIniziareOggi({ ...base, eta: 63 })).toBeNull();
  });
});
