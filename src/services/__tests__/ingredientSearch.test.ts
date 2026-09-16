import { searchIngredientsSync } from '../mock/ingredientService';

describe('ingredient search', () => {
  it('returns the suggested list for an empty query, in the PDF order', () => {
    const names = searchIngredientsSync('').map((i) => i.name);
    expect(names.slice(0, 4)).toEqual(['Eggs', 'Sesame', 'Soy', 'Alcohol']);
  });

  it('ranks exact and prefix name matches before alias matches', () => {
    const names = searchIngredientsSync('milk').map((i) => i.name);
    expect(names[0]).toBe('Milk');
    expect(names).toContain('Lactose');
  });

  it('finds ingredients by label alias and ignores accents and case', () => {
    expect(searchIngredientsSync('TAHINI').map((i) => i.id)).toContain('sesame');
    expect(searchIngredientsSync('Whéy').map((i) => i.id)).toContain('milk');
  });

  it('returns nothing for unknown terms', () => {
    expect(searchIngredientsSync('zzzz')).toEqual([]);
  });
});
