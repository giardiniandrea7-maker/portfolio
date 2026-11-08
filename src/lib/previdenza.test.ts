import { describe, expect, it } from 'vitest';

import { aliquotaUscita, calcola, MENSILE_MASSIMO, profilo } from './previdenza';

describe('calcola', () => {
  it('età 20: 47 anni alla pensione, profilo tempo', () => {
    const r = calcola({ eta: 20, fascia: 'da28a50', mensile: 200 });
    expect(r.anni).toBe(47);
    expect(r.profilo).toBe('tempo');
    expect(r.versatoAnno).toBe(2400);
    expect(r.rimborsoAnno).toBeCloseTo(792);
    expect(r.rimborsoTotale).toBeCloseTo(792 * 47);
    expect(r.costoReale).toBeCloseTo(200 - 66);
    expect(r.aliquotaUscita).toBe(9);
  });

  it('età 62: 5 anni alla pensione, profilo fisco', () => {
    const r = calcola({ eta: 62, fascia: 'fino28', mensile: 100 });
    expect(r.anni).toBe(5);
    expect(r.profilo).toBe('fisco');
    expect(r.rimborsoAnno).toBeCloseTo(1200 * 0.23);
    expect(r.aliquotaUscita).toBe(15);
    expect(r.valoreCinqueAnni).toBeCloseTo(r.rimborsoAnno * 5);
  });

  it('sopra il limite il rimborso resta fermo a 5.300 × aliquota', () => {
    const r = calcola({ eta: 45, fascia: 'oltre50', mensile: 1000 });
    expect(r.versatoAnno).toBe(5300);
    expect(r.rimborsoAnno).toBeCloseTo(5300 * 0.43);
    expect(calcola({ eta: 45, fascia: 'oltre50', mensile: MENSILE_MASSIMO }).rimborsoAnno).toBeCloseTo(5300 * 0.43);
  });

  it('tre fasce: 23%, 33%, 43%', () => {
    const base = { eta: 38, mensile: 100 };
    expect(calcola({ ...base, fascia: 'fino28' }).rimborsoAnno).toBeCloseTo(276);
    expect(calcola({ ...base, fascia: 'da28a50' }).rimborsoAnno).toBeCloseTo(396);
    expect(calcola({ ...base, fascia: 'oltre50' }).rimborsoAnno).toBeCloseTo(516);
  });

  it('extra giovani e rimborso massimo seguono l’aliquota', () => {
    const r = calcola({ eta: 25, fascia: 'fino28', mensile: 100 });
    expect(r.extraGiovani).toBeCloseTo(2650 * 0.23);
    expect(r.rimborsoMax).toBeCloseTo(5300 * 0.23);
  });
});

describe('aliquotaUscita', () => {
  it('10, 20 e 35 anni di partecipazione', () => {
    expect(aliquotaUscita(10)).toBe(15);
    expect(aliquotaUscita(20)).toBe(13.5);
    expect(aliquotaUscita(35)).toBe(9);
  });
});

describe('profilo', () => {
  it('soglia a 40 anni', () => {
    expect(profilo(39)).toBe('tempo');
    expect(profilo(40)).toBe('fisco');
  });
});
