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
    "No sé mi barrio (Consultar)", // Opción Prioritaria
    "Aeropuerto", "Alamos", "Aniversario I", "Aniversario II", "Antonia Santos",
    "Atalaya Primera Etapa", "Bajo Pamplonita", "Belisario", "Bellavista", "Bocono",
    "Bogota", "Bosque Popular", "Brisas del Aeropuerto", "Brisas del Paraiso",
    "Caobos", "Carora", "Ceiba", "Ceiba II", "Centro", "Chapinero", "Claret",
    "Comuneros", "Contento", "Cundinamarca", "El Bosque", "El Callejon",
    "El Llano", "El Rosal", "Estadio", "Garcia Herreros", "Guaimaral", "Guarinos",
    "La Cabrera", "La Florida", "La Riviera", "Lleras", "Loma de Bolivar", "Los Patios",
    "Niza", "Obreros", "Panamericano", "Paraiso", "Pescadero", "Popular",
    "Prados del Este", "Prados del Norte", "Quinta Bosch", "Quinta Oriental",
    "Residencial Bolivar", "Rosemberg", "San Eduardo", "San Luis", "San Martin",
    "San Mateo", "San Miguel", "San Rafael", "Santander", "Santo Domingo",
    "Siglo XXI", "Tasajero", "Torcoroma", "Trapiches", "Valle del Lili",
    "Villa del Rosario", "Virgilio Barco"
  ] as const,

  // Configuración de Horarios (Formato 24h)
  schedule: {
    startHour: 7, // 7 AM
    endHour: 18,  // 6 PM
    timezone: 'America/Bogota'
  },

  // Testimonios (Data Realista - Terminología 'Rollos' y lugares reales)
  testimonials: [
    { id: 1, text: "Esa leña aguanta bastante, con 2 rollos hicimos el asado.", author: "Carlos M.", location: "Prados del Este" },
    { id: 2, text: "Me gusta que la leña viene seca, prende de una. Pedí medio viaje.", author: "Restaurante La Fogata", location: "La Riviera" },
    { id: 3, text: "Llegó rapidito al negocio. La carga completa rinde para el fin de semana.", author: "Asadero El Tizón", location: "Ceiba II" },
    { id: 4, text: "Buen servicio, pedí 5 rollos y me los dejaron en la puerta.", author: "Andrés P.", location: "Bellavista" },
    { id: 5, text: "La mejor leña de Cúcuta, no humea tanto. Recomendados.", author: "Sra. Gloria", location: "San Luis" },
    { id: 6, text: "El domicilio fue volando. Pedí pal asado y en 20 min estaban aquí.", author: "Jorge L.", location: "Boconó" },
    { id: 7, text: "Los rollos vienen bien amarrados y la madera es maciza.", author: "Humberto G.", location: "Quinta Bosch" },
    { id: 8, text: "Siempre pido para el almuerzo. Cumplidos con la carga.", author: "Pizza & Leña", location: "Caobos" },
    { id: 9, text: "Barato y bueno. Con un rollo armé la fogata en la finca.", author: "Camilo R.", location: "Villa del Rosario" },
    { id: 10, text: "Me salvaron el negocio, no tenía gas y llegaron rápido con la leña para la sopa.", author: "Martha S.", location: "Atalaya" },
    { id: 11, text: "Para el sancocho del domingo apenas fue. Esos rollos rinden mucho.", author: "Doña Carmen", location: "San Rafael" },
    { id: 12, text: "Buena atención. Pedí 2 cargas para el restaurante y me dieron buen precio.", author: "Restaurante La Fogata", location: "El Bosque" },
    { id: 13, text: "La leña está sequita, nada de humo. Recomendado 100%.", author: "Julián T.", location: "Colsag" },
    { id: 14, text: "Me urgía para un evento y llegaron a tiempo. Muy serios.", author: "Eventos Cúcuta", location: "Quinta Oriental" },
    { id: 15, text: "Primera vez que pido por aquí y todo excelente. El muchacho muy amable.", author: "Andrea P.", location: "Guaimaral" },
    { id: 16, text: "Esos rollos vienen bien despachados, no como en otros.", author: "Sr. Pedro", location: "Loma de Bolívar" },
    { id: 17, text: "Calidad total. La uso para ahumar carnes y da buen sabor.", author: "Chef Mario", location: "Los Patios" },
    { id: 18, text: "Servicio rápido, no tocó esperar tanto.", author: "Luisa F.", location: "San Mateo" },
    { id: 19, text: "Ya soy cliente fijo. Mandan lo que es.", author: "Asados El Gordo", location: "La Libertad" },
    { id: 20, text: "Práctico pedir por acá. Uno se evita la vuelta.", author: "Felipe S.", location: "Niza" }
  ]
} as const;
