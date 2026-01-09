export const CONFIG = {
  phone: "573005648309",
  city: "Cúcuta",
  rateLimitSeconds: 3,
  packs: [
    {
      id: 'asado',
      title: "Pa'l Asado",
      sub: "La medida justa.",
      iconId: "steak",
      popular: false
    },
    {
      id: 'medio',
      title: "Medio Viaje",
      sub: "La preferida del barrio.",
      iconId: "logs",
      popular: true
    },
    {
      id: 'full',
      title: "Viaje Full",
      sub: "Leñera llena por mes.",
      iconId: "truck",
      popular: false
    },
  ],
  neighborhoods: [
    "Aeropuerto", "Atalaya", "Belén", "Bellavista", "Boconó", "Bogotá",
    "Caobos", "Ceiba", "Centro", "Chapinero", "Claret", "Colsag",
    "Comuneros", "Contento", "Cundinamarca", "Estadio", "Guaimaral",
    "La Libertad", "La Riviera", "Lleras", "Loma de Bolívar", "Malecón",
    "Niza", "Obrero", "Panamericano", "Pescadero", "Popular", "Prados del Este",
    "Prados del Norte", "Quinta Bosch", "Quinta Oriental", "San Eduardo",
    "San Luis", "San Martín", "San Mateo", "San Rafael", "Santander",
    "Tasajero", "Torcoroma", "Trigal", "Valles del Rodeo", "Virgilio Barco",
    "Zona Industrial", "No sé mi barrio (Consultar)"
  ]
} as const;
