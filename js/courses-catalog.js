/* =====================================================
   Courses Catalog 
===================================================== */

export const COURSES_CATALOG = [
  {
    course_id: "C1",
    title: "Maquillage Professionnel – Fondamentaux",
    level: "Débutant",
    level_color: "pink",

    description:
      "Techniques de base, préparation de la peau, produits essentiels et premières applications professionnelles.",

    languages: [
      { code: "ht", label: "Créole haïtien", primary: true },
      { code: "fr", label: "Français", primary: false }
    ],

    preview_image: "https://i.ibb.co/Vp3L3M8x/Training-TBA.jpg",
    preview_video: null,

    location: "Banj Delmas 66, Port-au-Prince",

    features: [
      "Vidéos explicatives",
      "Supports PDF",
      "Évaluation finale",
      "Certificat officiel"
    ]
  },

  {
    course_id: "C2",
    title: "Maquillage Événementiel & Bridal",
    level: "Avancé",
    level_color: "pink",

    description:
      "Looks professionnels pour mariages, événements spéciaux, gestion clientèle et finition haut de gamme.",

    languages: [
      { code: "fr", label: "Français", primary: true }
    ],

    preview_image: null,
    preview_video: null,

    location: "Banj, Delmas 66, Port-au-Prince",

    features: [
      "Techniques avancées",
      "Cas pratiques",
      "Examen certifiant",
      "Certificat numérique"
    ]
  },

  {
    course_id: "C3",
    title: "Maquillage Artistique (Carnavalesque)",
    level: "Artistique",
    level_color: "purple",

    description:
      "Techniques créatives et expressives pour carnavals, scènes artistiques, événements culturels et spectacles.",

    languages: [
      { code: "ht", label: "Créole haïtien", primary: true }
    ],

    preview_image: null,
    preview_video: null,

    location: "Banj, Delmas 66, Port-au-Prince",

    features: [
      "Création de personnages",
      "Couleurs & effets spéciaux",
      "Maquillage scénique",
      "Certificat artistique"
    ]
  },

  {
    course_id: "C4",
    title: "Onglerie – Nail Technician",
    level: "Professionnel",
    level_color: "green",

    description:
      "Formation complète en soins des ongles, pose gel & acrylique, nail art moderne et hygiène professionnelle.",

    languages: [
      { code: "fr", label: "Français", primary: true }
    ],

    preview_image: null,
    preview_video: null,

    location: "Banj, Delmas 66, Port-au-Prince",

    features: [
      "Manucure & pédicure",
      "Gel, acrylique & capsules",
      "Nail art tendance",
      "Certificat professionnel"
    ]
  }
];
