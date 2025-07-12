import {
  Grids
} from './grids';
import {
  Indicatore
} from './indicatore';

describe('Grids', () => {
  it('should create an instance', () => {
    const grids = new Grids();
    expect(grids).toBeTruthy();
  });

  it('should build from args', () => {
    const args = {
      key: 'k',
      nome: 'nome',
      descrizione: 'desc',
      indicatori: [{}, {}]
    };
    const grids = new Grids(args);
    expect(grids.key).toBe('k');
    expect(grids.nome).toBe('nome');
    expect(grids.descrizione).toBe('desc');
    expect(Array.isArray(grids.indicatori)).toBeTrue();
  });

  it('should serialize correctly', () => {
    const grids = new Grids({ key: 'k', nome: 'n', descrizione: 'd', indicatori: [] });
    const serialized = grids.serialize();
    expect(serialized.key).toBe('k');
    expect(serialized.nome).toBe('n');
    expect(serialized.descrizione).toBe('d');
    expect(Array.isArray(serialized.indicatori)).toBeTrue();
  });
});
