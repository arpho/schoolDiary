import {
  Criterio
} from './criterio';

describe('Criterio', () => {
  it('should create an instance with default values', () => {
    const criterio = new Criterio();
    expect(criterio.key).toBe('');
    expect(criterio.descrizione).toBe('');
    expect(criterio.rangeValue).toBe('');
  });

  it('should assign values from args', () => {
    const args = {
      key: 'k1',
      descrizione: 'desc',
      rangeValue: '1-5'
    };
    const criterio = new Criterio(args);
    expect(criterio.key).toBe('k1');
    expect(criterio.descrizione).toBe('desc');
    expect(criterio.rangeValue).toBe('1-5');
  });

  it('should serialize correctly', () => {
    const criterio = new Criterio({
      key: 'k',
      descrizione: 'd',
      rangeValue: 'r'
    });
    const serialized = criterio.serialize();
    expect(serialized).toEqual({
      key: 'k',
      descrizione: 'd',
      rangeValue: 'r'
    });
  });

  it('should handle missing args gracefully', () => {
    const criterio = new Criterio(undefined);
    expect(criterio.key).toBe('');
    expect(criterio.descrizione).toBe('');
    expect(criterio.rangeValue).toBe('');
  });

  it('should handle partial args', () => {
    const criterio = new Criterio({ key: 'only-key' });
    expect(criterio.key).toBe('only-key');
    expect(criterio.descrizione).toBe('');
    expect(criterio.rangeValue).toBe('');
  });
});
