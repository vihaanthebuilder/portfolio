// NASA GSFC/NSSDC Planetary Fact Sheet values; distances are mean distance / AU.
// Day Length uses NASA's solar-day measure. Year values are the Fact Sheet's
// sidereal orbital periods. Fun facts are paraphrased from NASA planet pages.
export const planetFacts = {
  Mercury: {
    distance: '0.387 AU', mass: '0.0553 Earths', day: '4,222.6 hours', year: '88.0 days', tilt: '0.034°', speed: '47.4 km/s',
    fun: 'Mercury is not the hottest planet. Venus is hotter.',
    source: 'https://science.nasa.gov/mercury/facts/'
  },
  Venus: {
    distance: '0.723 AU', mass: '0.815 Earths', day: '2,802 hours', year: '224.7 days', tilt: '177.4°', speed: '35.0 km/s',
    fun: 'A Venus day is longer than a Venus year.',
    source: 'https://science.nasa.gov/venus/venus-facts/'
  },
  Earth: {
    distance: '1 AU', mass: '1 Earth', day: '24 hours', year: '365 days', tilt: '23.5°', speed: '29.8 km/s',
    fun: 'Earth is the only world we know with liquid water on its surface.',
    source: 'https://science.nasa.gov/earth/facts/'
  },
  Mars: {
    distance: '1.524 AU', mass: '0.107 Earths', day: '24.7 hours', year: '687 days', tilt: '25.2°', speed: '24.1 km/s',
    fun: 'Mars is home to Olympus Mons, the largest volcano in the solar system.',
    source: 'https://science.nasa.gov/mars/facts/'
  },
  Jupiter: {
    distance: '5.203 AU', mass: '317.8 Earths', day: '9.9 hours', year: '4,331 days', tilt: '3.1°', speed: '13.1 km/s',
    fun: 'Jupiter’s Great Red Spot is a giant storm bigger than Earth.',
    source: 'https://science.nasa.gov/jupiter/jupiter-facts/'
  },
  Saturn: {
    distance: '9.571 AU', mass: '95.2 Earths', day: '10.7 hours', year: '10,747 days', tilt: '26.7°', speed: '9.7 km/s',
    fun: 'Saturn’s average density is lower than water’s.',
    source: 'https://science.nasa.gov/saturn/facts/'
  },
  Uranus: {
    distance: '19.16 AU', mass: '14.5 Earths', day: '17.2 hours', year: '30,589 days', tilt: '97.8°', speed: '6.8 km/s',
    fun: 'Uranus rolls around the Sun on its side.',
    source: 'https://science.nasa.gov/uranus/facts/'
  },
  Neptune: {
    distance: '30.18 AU', mass: '17.1 Earths', day: '16.1 hours', year: '59,800 days', tilt: '28.3°', speed: '5.4 km/s',
    fun: 'Neptune has the strongest winds measured on any planet.',
    source: 'https://science.nasa.gov/mission/voyager/fact-sheet/'
  }
};
