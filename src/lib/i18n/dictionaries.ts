export type Locale = 'es' | 'en'

export const locales: Locale[] = ['es', 'en']
export const defaultLocale: Locale = 'es'

export interface Dictionary {
  nav: {
    group_main: string
    dashboard: string
    calendar: string
    group_players: string
    players: string
    group_training: string
    sessions: string
    series: string
    blocks: string
    plans: string
    group_strategy: string
    strategies: string
    boards: string
    group_competition: string
    tournaments: string
    settings: string
  }
  header: {
    search: string
    logout: string
    theme_light: string
    theme_dark: string
    language: string
  }
  settings: {
    title: string
    branding_title: string
    branding_desc: string
    brand_name: string
    brand_name_placeholder: string
    brand_logo: string
    brand_color: string
    save: string
    appearance_title: string
    appearance_desc: string
    appearance_hint: string
  }
}

export const dictionaries: Record<Locale, Dictionary> = {
  es: {
    nav: {
      group_main: 'Principal',
      dashboard: 'Panel',
      calendar: 'Calendario',
      group_players: 'Jugadores',
      players: 'Jugadores',
      group_training: 'Entrenamiento',
      sessions: 'Sesiones',
      series: 'Series',
      blocks: 'Bloques',
      plans: 'Planes',
      group_strategy: 'Estrategia',
      strategies: 'Estrategias',
      boards: 'Pizarras',
      group_competition: 'Competencias',
      tournaments: 'Competencias',
      settings: 'Ajustes',
    },
    header: {
      search: 'Buscar',
      logout: 'Salir',
      theme_light: 'Modo claro',
      theme_dark: 'Modo oscuro',
      language: 'Idioma',
    },
    settings: {
      title: 'Ajustes',
      branding_title: 'Marca',
      branding_desc: 'Personaliza cómo se ve tu marca para tus jugadores.',
      brand_name: 'Nombre de marca',
      brand_name_placeholder: 'pctmt',
      brand_logo: 'URL del logo',
      brand_color: 'Color principal',
      save: 'Guardar',
      appearance_title: 'Apariencia',
      appearance_desc: 'Elige el tema y el idioma de tu panel.',
      appearance_hint: 'Usa los controles de la barra superior para cambiar el tema y el idioma.',
    },
  },
  en: {
    nav: {
      group_main: 'Main',
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      group_players: 'Players',
      players: 'Players',
      group_training: 'Training',
      sessions: 'Sessions',
      series: 'Series',
      blocks: 'Blocks',
      plans: 'Plans',
      group_strategy: 'Strategy',
      strategies: 'Strategies',
      boards: 'Boards',
      group_competition: 'Competitions',
      tournaments: 'Competitions',
      settings: 'Settings',
    },
    header: {
      search: 'Search',
      logout: 'Log out',
      theme_light: 'Light mode',
      theme_dark: 'Dark mode',
      language: 'Language',
    },
    settings: {
      title: 'Settings',
      branding_title: 'Branding',
      branding_desc: 'Customize how your brand looks to your players.',
      brand_name: 'Brand name',
      brand_name_placeholder: 'pctmt',
      brand_logo: 'Logo URL',
      brand_color: 'Primary color',
      save: 'Save',
      appearance_title: 'Appearance',
      appearance_desc: 'Choose your dashboard theme and language.',
      appearance_hint: 'Use the controls in the top bar to switch theme and language.',
    },
  },
}
