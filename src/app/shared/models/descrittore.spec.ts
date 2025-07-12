import {
  Descrittore
} from './descrittore';

describe('Descrittore', () => {
  it('should create an instance', () => {
    const d = new Descrittore();
    expect(d).toBeTruthy();
  });

  it('should build from args', () => {
    const args = { key: 'k', descrizione: 'desc', value: 10 };
    const d = new Descrittore(args);
    expect(d.key).toBe('k');
    expect(d.descrizione).toBe('desc');
    expect(d.value).toBe(10);
  });

  it('should serialize correctly', () => {
    const d = new Descrittore({ key: 'x', descrizione: 'y', value: 1 });
    const serialized = d.serialize();
    expect(serialized.key).toBe('x');
    expect(serialized.descrizione).toBe('y');
    expect(serialized.value).toBe(1);
  });
});
