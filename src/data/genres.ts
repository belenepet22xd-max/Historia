import { GenreInfo } from '../types';

export const GENRES: Record<string, GenreInfo> = {
  'Misterio': {
    id: 'Misterio',
    title: 'Misterio',
    tagline: 'Sombras, criptogramas y secretos victorianos',
    description: 'Mansiones decrépitas cubiertas de niebla, llaves de bronce manchadas, cartas anónimas lacradas en cera negra y enigmas ancestrales donde nada es lo que aparenta.',
    iconName: 'Search',
    themeColor: {
      primary: '#d97706', // amber-600
      border: 'border-amber-700/50',
      bg: 'from-amber-950/40 via-neutral-900 to-neutral-950',
      glow: 'rgba(217, 119, 6, 0.15)',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      accent: 'text-amber-400',
    },
    sampleSetting: 'La Mansión Blackwood en la escarpada costa de Cornualles',
    keywords: ['Mansión victoriana', 'Reloj de péndulo', 'Criptograma', 'Silueta enlutada']
  },
  'Policial': {
    id: 'Policial',
    title: 'Policial',
    tagline: 'Calles mojadas, crimen organizado y pesquisas al límite',
    description: 'Lluvia ácida sobre muelles desiertos, disparos en la madrugada, agentes de Asuntos Internos pisándote los talones y una verdad incómoda oculta tras el hedor a pólvora y corrupción.',
    iconName: 'ShieldAlert',
    themeColor: {
      primary: '#38bdf8', // sky-400
      border: 'border-sky-700/50',
      bg: 'from-slate-950/80 via-neutral-900 to-neutral-950',
      glow: 'rgba(56, 189, 248, 0.15)',
      badge: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
      accent: 'text-sky-400',
    },
    sampleSetting: 'Distrito Portuario y Callejones de San Kessel',
    keywords: ['Cinta de casete', 'Lluvia y sirenas', 'Casquillos percutidos', 'Interrogatorio']
  },
  'Ciencia Ficción': {
    id: 'Ciencia Ficción',
    title: 'Ciencia Ficción',
    tagline: 'Anomalías cuánticas, naves a la deriva e IA insurgentes',
    description: 'Estaciones orbitales en cuarentena, núcleos de fusión fracturados, implantes neurales al límite y biomas fractales expandiéndose en el silencio abisal del cosmos.',
    iconName: 'Compass',
    themeColor: {
      primary: '#a855f7', // purple-500
      border: 'border-purple-700/50',
      bg: 'from-purple-950/40 via-neutral-900 to-neutral-950',
      glow: 'rgba(168, 85, 247, 0.15)',
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      accent: 'text-purple-400',
    },
    sampleSetting: 'Estación Orbital Hyperion-4 en órbita sincrónica',
    keywords: ['IA desbocada', 'Implante cortical', 'Salto hiperespacial', 'Gravedad cero']
  },
  'Fantasía': {
    id: 'Fantasía',
    title: 'Fantasía',
    tagline: 'Espadas rúnicas, juramentos de sangre y magia olvidada',
    description: 'Valles de ceniza volcánica, criptas ciclópeas custodiadas por gárgolas de obsidiana, reliquias oscuras que exigen sacrificios y reinos olvidados al borde de la extinción.',
    iconName: 'Flame',
    themeColor: {
      primary: '#10b981', // emerald-500
      border: 'border-emerald-700/50',
      bg: 'from-emerald-950/40 via-neutral-900 to-neutral-950',
      glow: 'rgba(16, 185, 129, 0.15)',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      accent: 'text-emerald-400',
    },
    sampleSetting: 'El Valle de los Reyes Olvidados y la Cripta de Valthor',
    keywords: ['Acero rúnico', 'Cripta de basalto', 'Magia primordial', 'Pacto sombrío']
  }
};
