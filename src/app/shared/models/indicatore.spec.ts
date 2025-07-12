import {
  Indicatore
} from './indicatore';
import {
  Criterio
} from './criterio';

describe('Indicatore', () => {
  it('should create an instance', () => {
    const indicatore = new Indicatore();
    expect(indicatore).toBeTruthy();
  });

  it('should build from args', () => {
    const args = {
      criteri: [{}],
      voto: 8,
      descrizione: 'desc'
    };
    const indicatore = new Indicatore(args);
    expect(indicatore.voto).toBe(8);
    expect(indicatore.descrizione).toBe('desc');
    expect(Array.isArray(indicatore.criteri)).toBeTrue();
  });

  it('should serialize correctly', () => {
    const indicatore = new Indicatore({ criteri: [], voto: 5, descrizione: 'test' });
    const serialized = indicatore.serialize();
    expect(serialized.voto).toBe(5);
    expect(serialized.descrizione).toBe('test');
    expect(Array.isArray(serialized.criteri)).toBeTrue();
  });
});
