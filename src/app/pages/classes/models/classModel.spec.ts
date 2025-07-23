import { ClasseModel } from './classModel';

describe('ClasseModel', () => {
  let model: ClasseModel;

  beforeEach(() => {
    model = new ClasseModel();
  });

  it('should create an instance with default values', () => {
    expect(model).toBeTruthy();
    expect(model.year).toBe('');
    expect(model.classe).toBe('');
    expect(model.descrizione).toBe('');
    expect(model.note).toBe('');
    expect(model.archived).toBe(false);
    expect(model.key).toBe('');
  });

  it('should build model with provided values', () => {
    const args = {
      year: '2023-2024',
      classe: '3A',
      descrizione: 'Classe di informatica',
      note: 'Classe attiva',
      archived: true,
      key: 'class123'
    };

    model.build(args);

    expect(model.year).toBe(args.year);
    expect(model.classe).toBe(args.classe);
    expect(model.descrizione).toBe(args.descrizione);
    expect(model.note).toBe(args.note);
    expect(model.archived).toBe(args.archived);
    expect(model.key).toBe(args.key);
  });

  it('should serialize model correctly', () => {
    const args = {
      year: '2023-2024',
      classe: '3A',
      descrizione: 'Classe di informatica',
      note: 'Classe attiva',
      archived: true,
      key: 'class123'
    };

    model.build(args);
    const serialized = model.serialize();

    expect(serialized.year).toBe(args.year);
    expect(serialized.classe).toBe(args.classe);
    expect(serialized.description).toBe(args.descrizione);
    expect(serialized.note).toBe(args.note);
    expect(serialized.archived).toBe(args.archived);
    expect(serialized.key).toBe(args.key);
  });

  it('should set key correctly', () => {
    const newKey = 'class456';
    model.setKey(newKey);
    expect(model.key).toBe(newKey);
  });
});
