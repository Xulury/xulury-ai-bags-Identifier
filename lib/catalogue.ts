// Mock catalogue of supported luxury houses + popular models.
// In production this would come from GET /api/v1/catalogue.

export const BRANDS: { name: string; models: string[] }[] = [
  {
    name: 'Louis Vuitton',
    models: ['Neverfull MM', 'Neverfull GM', 'OnTheGo MM', 'Speedy 30', 'Alma BB', 'Capucines'],
  },
  {
    name: 'Chanel',
    models: ['Classic Flap Medium', 'Boy Bag', '19 Bag', 'Deauville Tote', 'Gabrielle'],
  },
  {
    name: 'Hermès',
    models: ['Birkin 30', 'Kelly 28', 'Constance', 'Garden Party', 'Evelyne'],
  },
  {
    name: 'Gucci',
    models: ['GG Marmont', 'Dionysus', 'Jackie 1961', 'Ophidia', 'Horsebit 1955'],
  },
  {
    name: 'Prada',
    models: ['Galleria', 'Re-Edition 2005', 'Cleo', 'Cahier'],
  },
  {
    name: 'Dior',
    models: ['Lady Dior', 'Saddle Bag', 'Book Tote', 'Caro'],
  },
  {
    name: 'Bottega Veneta',
    models: ['Jodie', 'Cassette', 'Arco', 'Pouch'],
  },
  {
    name: 'Saint Laurent',
    models: ['Loulou', 'Kate', 'Niki', 'Sac de Jour'],
  },
]

export const ALL_BRAND_NAMES = BRANDS.map((b) => b.name)
