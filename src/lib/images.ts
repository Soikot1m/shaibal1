// Curated demo imagery (stock photography). Replace with admin-uploaded images
// or real destination galleries in production. Demo content only.

const px = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;

const wide = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900`;

export const IMG = {
  // Bangladesh nature
  sajekHills: px(28672619),
  sajekRainbow: px(2852395),
  greenHills: px(32877173),
  palmHills: px(38414436, "png"),
  cloudMountains: px(14024477),
  ruralBandarban: px(37818818),
  coxBazar: px(122107),
  coxBazarSunset: px(38183292),
  coxBazarBeach: px(34984159),
  beachChairs: px(12851496),
  fisherman: px(36840722),
  lakeBoat: px(31212363),
  lakeBoats: px(34182009),
  phewaLake: px(35917995),
  teaLeaves: px(16246007),
  teaGarden: px(19102359),
  teaGardenOpen: px(30390430),
  mangrove: px(36584778),
  mangroveAerial: px(27270929),
  mangroveBoat: px(14021572),
  // adventure / travelers
  hikerSunrise: px(17838372),
  seaClouds: px(3232529),
  rockyTrail: px(15389334),
  sunsetHiker: px(30796779),
  // resorts
  infinityPool: px(9845436),
  poolDanang: px(28226576, "png"),
  resortPool: px(12387908),
  poolSunset: px(24807133),
  // international
  thailandPalace: px(11104933),
  thailandTemple: px(33413818),
  thailandEmerald: px(16773188),
  thailandWatPho: px(16749320),
  nepalStupa: px(36564643),
  nepalPatan: px(30954090),
  nepalBoudha: px(36727736),
  // couple
  coupleMountain: px(34544543),
  coupleWalk: px(13111976),
  coupleBalcony: px(14349210),
  // hero
  hero: wide(17838372),
  hero2: wide(3232529),
  hero3: wide(9845436),
};

export const HERO_IMAGES = [IMG.hero, IMG.hero2, IMG.hero3, IMG.sajekHills, IMG.coxBazarSunset];
