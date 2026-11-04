const STAT_SCHEMA = [
  // Must-have (except parkours)
  { key: 'played', label: 'Games Played' },
  { key: 'victories', label: 'Games Won' },
  {
    key: 'losses',
    label: 'Games Lost',
    getValue: (d) =>
      typeof d.played === 'number' && typeof d.victories === 'number'
        ? d.played - d.victories
        : undefined,
  },
  {
    key: 'win_rate',
    label: 'Win Rate',
    getValue: (d) =>
      typeof d.victories === 'number' && typeof d.played === 'number' && d.played > 0
        ? ((d.victories / d.played) * 100).toFixed(2) + '%'
        : undefined,
  },

  // Combat Stats (and stats related to ctf, sky, bed, sg)
  { key: 'kills', label: 'Kills' },
  { key: 'final_kills', label: 'Final Kills' },
  { key: 'deaths', label: 'Deaths' },
  { key: 'assists', label: 'Assists' },
  {
    key: 'kd_ratio',
    label: 'K/D Ratio',
    combatOnly: true,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.deaths === 'number'
        ? (d.deaths > 0 ? d.kills / d.deaths : d.kills).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_kills',
    label: 'Average Kills / Game',
    combatOnly: true,
    getValue: (d) =>
      typeof d.kills === 'number' && typeof d.played === 'number' && d.played > 0
        ? (d.kills / d.played).toFixed(2)
        : undefined,
  },
  {
    key: 'avg_deaths',
    label: 'Average Deaths / Game',
    combatOnly: true,
    getValue: (d) =>
      typeof d.deaths === 'number' && typeof d.played === 'number' && d.played > 0
        ? (d.deaths / d.played).toFixed(2)
        : undefined,
  },

  // Stats for other modes

  // ctf
  { key: 'flags_captured', label: 'Flags Captured' },
  { key: 'flags_returned', label: 'Flags Returned' },

  // bed
  { key: 'beds_destroyed', label: 'Beds Destroyed' },

  // sky-kits & sky-classic

  { key: 'ore-mined', label: 'Ore Mined' },
  { key: 'spell_used', label: 'Spells Used' },
  { key: 'mystery_chests_destroyed', label: 'Mystery Chests Destroyed' },
  { key: 'selected_kit', label: 'Selected Kit' },

  // tw (legacy)
  { key: 'treasures_destroyed', label: 'Treasures Destroyed' },

  // mm
  { key: 'murders', label: 'Murders' },
  { key: 'murderer_eliminations', label: 'Murderer Eliminations' },
  { key: 'coins', label: 'Coins' },

  // hide
  { key: 'hider_kills', label: 'Hider Kills' },
  { key: 'seeker_kills', label: 'Seeker Kills' },

  // dr
  { key: 'checkpoints', label: 'Checkpoints' },
  { key: 'activated', label: 'Traps Activated' },

  // build
  { key: 'rating_love_received', label: 'Love Ratings' },
  { key: 'rating_great_received', label: 'Great Ratings' },
  { key: 'rating_good_received', label: 'Good Ratings' },
  { key: 'rating_okay_received', label: 'Okay Ratings' },
  { key: 'rating_meh_received', label: 'Meh Ratings' },

  // misc
  { key: 'goals', label: 'Goals' },

  // XP
  { key: 'xp', label: 'XP' },
]

const STATS_SCHEMAS_PARKOUR = [
  {
    world: 'Volcano',
    courses: ['Magma Meltdown', 'Bone Basin', 'Wyrm Winding', 'Dungeon Dash', "Dragon's Dare"],
  },
  {
    world: 'Rooftops',
    courses: [
      'Balloon Bounce',
      'Rooftop Rise',
      'Courtyard Crossing',
      'Sewer Slog',
      'Highwire Hijinks',
    ],
  },
  {
    world: 'City',
    courses: [
      'Playground Peril',
      'Subway Scramble',
      'Highrise Hurdle',
      'Tower Transcend',
      'Garage Grind',
    ],
  },
  {
    world: 'Jungle',
    courses: ['Willow Whirl', 'Canopy Climb', 'Cavern Conundrum', 'Temple Turmoil', 'Jungle Jaunt'],
  },
]

export { STAT_SCHEMA, STATS_SCHEMAS_PARKOUR }
