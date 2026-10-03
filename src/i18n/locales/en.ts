export const en = {
  nav: {
    liveIndex: "Live Index",
    cityReports: "City Reports",
    explorer: "Explorer",
    dataset: "Dataset",
    methodology: "Methodology",
    about: "About",
    indexOnline: "Index Online",
    brandSub: "Algeria Urban Congestion Index",
  },
  a11y: {
    language: "Language",
  },
  common: {
    days: {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
    },
    months: {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    },
    workday: "Sun–Thu",
    weekend: "Fri–Sat",
    highways: "Highways",
    normalRoutes: "Normal routes",
    allRoads: "All roads",
    low: "Low",
    high: "High",
    km: "km",
    switchCity: "Switch city",
  },
  level: {
    free: "Fluid",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
  },
  class: {
    green: "Free flow",
    yellow: "Moderate",
    red: "Heavy",
    dark_red: "Gridlock",
  },
  errors: {
    notFoundTitle: "Page not found",
    notFoundBody: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
    crashTitle: "This page didn't load",
    crashBody: "Something went wrong on our end. You can try refreshing or head back home.",
    tryAgain: "Try again",
    datasetLoading: "Reading CSV dataset…",
    datasetErrorTitle: "Dataset could not be read",
    datasetErrorUnknown: "Unknown error while parsing the CSV files.",
  },
  footer: {
    body: "An open measurement framework for urban road congestion across Algeria, built as an engineering internship initiative at ESTIN.",
    dataSource: "Data Source",
    dataValue: "Bundled CSV reference dataset",
    coverage: "Coverage",
    coverageValue: "27 metropolitan areas",
    about: "About",
    teamSchool: "Team & school",
  },
  home: {
    title: "Algeria Urban Congestion Index",
    intro:
      "Congestion across {{count}} metropolitan areas, measured from street-level traffic imagery against each zone's own free-flow baseline.",
    nationalAverage: "National average",
    deltaVsPrevious: "{{value}} pts vs previous period",
    weightedNote: "Population-weighted across all monitored hubs.",
    monitoredNetwork: "Monitored network",
    roadTracked: "of road tracked across {{count}} cities",
    avgCoverage: "{{value}}% avg coverage",
    snapshots: "{{count}} snapshots",
    mostCongested: "Most congested city",
    indexRank: "{{value}}% index · rank #1 of {{total}}",
    cityRanking: "City ranking",
    allReports: "All reports",
    peakWindowDistribution: "Peak window distribution",
    nationalAvgPerWindow: "National average per 2-hour window",
    analysisLabel: "Analysis:",
    analysisBody:
      "the national peak lands in the {{window}} window at {{pct}}% above each zone's calm baseline. Friday–Saturday flows stay below weekday saturation, reflecting the Algerian working week.",
    dayByDay: "Day by day",
    nationalMeanWindow: "National mean index across the measurement window",
    daysRange: "{{count}} days · {{from}} to {{to}}",
  },
  explore: {
    title: "Explorer",
    intro:
      "Slice the index by city, by weekday or weekend and by 2-hour window. Pick up to four cities to overlay their curves.",
    citiesFilter: "Cities",
    citiesSelected: "{{count}}/4 selected",
    citiesNational: "national average shown",
    daysLabel: "Days",
    allDays: "All days",
    weekday: "Weekday (Sun–Thu)",
    weekend: "Weekend (Fri–Sat)",
    metricLabel: "Metric",
    metricLevel: "Congestion level",
    metricChange: "Change vs previous window",
    roadClassLabel: "Road class",
    classScoredNote: "Scored on that class's own capacity and calm level.",
    worstWindow: "Worst window in view: {{city}} {{window}} at {{value}}%",
    chartLevelTitle: "Congestion level by 2-hour window",
    chartChangeTitle: "How fast congestion changes",
    chartLevelNote: "Mean index for the selected days",
    chartChangeNote: "Difference between consecutive 2-hour windows (positive = worsening)",
    classOnly: "{{class}} only",
    selectCitiesPrompt: "Select one or more cities above to draw their curves.",
    highwaysVsNormal: "Highways vs normal routes",
    highwaysVsNormalNote: "Same index formula computed on each road class's own capacity",
    selectCitiesClasses: "Select cities to compare road classes.",
    dayByDayCity: "{{city}} · day by day",
    dayByDayNational: "National · day by day",
    meanPerDay: "Mean index per calendar day",
    noDailyData: "No daily data.",
    indexSeries: "index",
  },
  data: {
    title: "Dataset",
    intro:
      "Every figure on this site is computed in the browser from three CSV files. Replace them with your own measurement exports — the whole index recalculates instantly.",
    customActive: "Custom CSV active",
    referenceActive: "Reference dataset",
    counts: "{{cities}} cities · {{hourly}} hourly rows · {{monthly}} monthly rows",
    restore: "Restore reference data",
    files: {
      cities: { note: "One row per monitored city — headline figures." },
      hourly: { note: "One row per city × day of week × hour." },
      monthly: { note: "One row per city × year × month." },
    },
    importCsv: "Import CSV",
    downloadSample: "Download sample",
    previewTitle: "cities.csv preview",
    previewSubtitle: "First rows as currently parsed",
    hCity: "City",
    hWilaya: "Wilaya",
    hIndex: "Index",
    hPrevious: "Previous",
    hNetwork: "Network (km)",
    hFreeFlow: "Free flow",
    hAm: "AM",
    hPm: "PM",
    statusMissing: "{{file}}: missing column(s) {{columns}}",
    statusLoaded: "{{file}} loaded into the index ({{key}}).",
    statusReset: "Reverted to the bundled reference dataset.",
  },
  cities: {
    breadcrumbCityReports: "City reports",
    wilayaOf: "Wilaya of {{wilaya}}",
    rankOf: "Rank {{rank}} of {{total}}",
    population: "population",
    ptsYoY: "{{value}} pts YoY",
    stat: {
      index: "Congestion index",
      areas: "Monitored areas",
      network: "Road network",
      visibility: "Avg visibility",
    },
    throughTheDay: "Congestion through the day",
    throughTheDayNote: "Mean index per 2-hour window · peak at {{peak}}",
    weeklyHeatmap: "Weekly density heatmap",
    weeklyHeatmapNote: "7 days × 2-hour slots, congestion intensity",
    coverageNetwork: "Coverage & network",
    coverageNetworkNote: "How much road each snapshot sees, and how the monitored network splits",
    levelMixByRoadClass: "Congestion level mix by road class",
    levelMixNote: "Google traffic colors across normal routes and highways",
    noComposition: "No composition data available.",
    areaBreakdown: "Area breakdown",
    areaBreakdownNote: "{{count}} monitored areas · sorted by congestion",
  },
  network: {
    roadNetworkMonitored: "Road network monitored",
    referenceNetworkAcross: "reference network across {{count}} areas",
    avgVisibility: "Avg visibility",
    snapshots: "{{count}} snapshots",
    coverageNote:
      "Google colors only roads with live traffic data, so night snapshots see fewer roads. Coverage compares what each snapshot actually saw against the zone's reference network (99th percentile of road length ever observed).",
    normalRoutesNote: "normal routes",
    tableLevel: "Level",
    tableNormal: "Normal",
    tableHighway: "Highway",
    colorNote:
      "Share of each road class's capacity shown in every traffic color, averaged over the whole window. A dark-red share above zero means part of the network was at a standstill.",
    area: "Area",
    congestion: "Congestion",
    avgCoverage: "Avg coverage",
    network: "Network",
    calmLevel: "Calm level",
    snapshotsCol: "Snapshots",
    zone: "Zone {{area}}",
  },
  ranking: {
    rank: "Rank",
    cityWilaya: "City / Wilaya",
    congestion: "Congestion",
    roadNetwork: "Road network",
    status: "Status",
    trend: "Trend",
  },
  heatmap: {
    hoverHint: "Hover a cell to inspect the hour",
    cellValue: "{{day}} {{hour}} — {{value}}% above free flow",
    cellAria: "{{day}} {{hour}} — {{value}}%",
  },
  map: {
    ariaMap: "Congestion map of northern Algeria",
    ariaCity: "{{city}}, congestion index {{value}} percent",
    geospatialView: "Geospatial view",
    northernCorridor: "Northern corridor · {{count}} cities",
    bubbleLegend: "Bubble size and color = congestion index",
    clickToOpen: "Click to open the city report",
    areasNetwork: "{{count}} areas · {{km}} km network",
    congestionScale: "Congestion scale",
    scale: {
      critical: "Critical (14%+)",
      high: "High (11–14%)",
      moderate: "Moderate (7–11%)",
      free: "Fluid (<7%)",
    },
  },
  methodology: {
    technicalNote: "Technical note · v1.02",
    title: "Methodology",
    intro:
      "The Algeria Urban Congestion Index measures how congested a road network is compared with the same network under free-flow conditions. It is deliberately comparable with international travel-time indices so Algerian cities can be benchmarked abroad.",
    steps: {
      capacity: {
        title: "Zone capacity",
        body: "For every zone we take the 99th percentile of road length ever observed across its snapshots. That value becomes K, the reference network. Roads missing from a night snapshot count as free-flowing, not as missing data.",
      },
      share: {
        title: "Weighted congestion share",
        body: "Each snapshot's colored segments collapse into a single number: yellow counts once, red twice, dark red three times, divided by K. The result is the share of the network at gridlock-equivalent load.",
      },
      baseline: {
        title: "Calm baseline & anchoring",
        body: "Every zone has its own typical calm level: the 20th percentile of its raw values. The published index is how far the current state sits between that calm level and total saturation, scaled 0-100.",
      },
      aggregation: {
        title: "Aggregation",
        body: "Snapshots average into days weighted by how much road each actually saw, days into zones, zones into cities weighted by network size. Highways and normal routes are scored on their own capacities.",
      },
    },
    formulaLabel: "Index formula",
    formulaNote:
      "where K is the zone's reference network (99th percentile of observed road length) and calm its 20th-percentile free-flow state. Peaks are reported separately for the morning (06:00–10:00) and evening (16:00–20:00) windows.",
    scaleTitle: "Congestion scale",
    scale: {
      fluid: "Fluid",
      fluidRange: "Below {{max}}%",
      moderate: "Moderate",
      moderateRange: "{{min}}% – {{max}}%",
      high: "High",
      highRange: "{{min}}% – {{max}}%",
      critical: "Critical",
      criticalRange: "{{min}}% and above",
    },
    limitationsTitle: "Limitations",
    limitations: {
      one: "Coverage is concentrated on the northern corridor; Saharan wilayas have thinner sampling and wider confidence intervals.",
      two: "The working week is Sunday–Thursday; Friday and Saturday profiles are reported as the weekend series.",
      three:
        "Public-holiday and Ramadan periods shift peak hours substantially and are flagged but not removed from the monthly series.",
    },
    terminologyTitle: "Terminology",
    terminologyNote: "Every term the site and this methodology page use, in one place.",
    terms: {
      congestionIndex: {
        term: "Congestion index",
        definition:
          "The headline 0–100 score for a city, zone or the whole network: how far the current state sits between that unit's calm level and total saturation.",
      },
      zone: {
        term: "Zone (area)",
        definition:
          "A monitored district of a city. It is the unit each traffic-image snapshot is cropped to, and the smallest level we publish.",
      },
      snapshot: {
        term: "Snapshot",
        definition:
          "One timestamped capture of a zone's street-level traffic imagery. Snapshots arrive roughly every two hours and are the raw input of the whole index.",
      },
      referenceNetwork: {
        term: "Reference network (K)",
        definition:
          "The 99th percentile of road length ever observed in a zone. It is the denominator of the congestion share, so a zone is always compared against its own busiest possible state.",
      },
      gridlockLoad: {
        term: "Gridlock-equivalent load (raw)",
        definition:
          "The weighted road length in trouble in one snapshot: (1 × yellow + 2 × red + 3 × dark_red) ÷ K. Red counts twice and dark red three times because standstill traffic costs more than slow traffic.",
      },
      calmLevel: {
        term: "Calm level",
        definition:
          "A zone's own free-flow baseline: the 20th percentile of its raw values. It removes the structural difference between a permanently busy city and a quiet one.",
      },
      coverage: {
        term: "Coverage",
        definition:
          "The share of a zone's reference network that a given snapshot actually saw. It weights the daily averages, so a thin night snapshot counts less than a full daytime one.",
      },
      twoHourWindow: {
        term: "2-hour window",
        definition:
          "The reporting slot of every curve on the site. Snapshots are binned into twelve two-hour windows per day, so a plotted point is an average, not a single measurement.",
      },
      workday: {
        term: "Workday",
        definition: "Sunday to Thursday — the Algerian working week.",
      },
      weekend: {
        term: "Weekend",
        definition: "Friday and Saturday.",
      },
      roadClass: {
        term: "Road class",
        definition:
          "The type of road a figure is computed on: a highway (motorway or expressway) or a normal route. Each class is scored on its own capacity and calm level.",
      },
      wilaya: {
        term: "Wilaya",
        definition: "The Algerian administrative province a city belongs to.",
      },
      congestionScale: {
        term: "Congestion scale",
        definition: "Fluid below 7%, Moderate 7–11%, High 11–14%, Critical at 14% and above.",
      },
    },
  },
  meta: {
    siteName: "Algeria Urban Congestion Index",
    home: {
      title: "Algeria Urban Congestion Index",
      description:
        "Congestion index for 27 Algerian metropolitan areas: rankings, peak-hour curves, road-network coverage and daily trends.",
      ogTitle: "Algeria Urban Congestion Index",
      ogDescription:
        "Congestion rankings, peak-hour analysis and network coverage across Algerian cities.",
    },
    cities: {
      title: "City Reports — Algeria Urban Congestion Index",
      description:
        "Detailed congestion report for each Algerian city: hourly profile, weekly heatmap, road-network coverage and area-by-area breakdown.",
      ogTitle: "City Reports — Algeria Urban Congestion Index",
      ogDescription: "Per-city congestion reports for the Algerian urban congestion index.",
    },
    city: {
      title: "{{city}} congestion report — Algeria Urban Congestion Index",
      description:
        "Hourly congestion profile, weekly heatmap, road-network coverage and area breakdown for {{city}}, Algeria.",
      ogTitle: "{{city}} congestion report — Algeria Urban Congestion Index",
      ogDescription: "Hourly profile, weekly heatmap and area breakdown for {{city}}.",
    },
    explore: {
      title: "Explorer — Algeria Urban Congestion Index",
      description:
        "Detailed congestion explorer: filter by city, weekday vs weekend and 2-hour time window; compare highways vs normal routes.",
    },
    data: {
      title: "Dataset & CSV Import — Algeria Urban Congestion Index",
      description:
        "Inspect the CSV schema behind the Algerian congestion index, import your own measurement files, or download the reference dataset.",
      ogTitle: "Dataset & CSV Import — Algeria Urban Congestion Index",
      ogDescription: "CSV schema, import tool and downloads for the Algerian congestion index.",
    },
    methodology: {
      title: "Methodology — Algeria Urban Congestion Index",
      description:
        "How the Algerian congestion index is computed: free-flow baselines, gridlock-equivalent load, the four-level congestion scale, and a glossary of every term used on the site.",
      ogTitle: "Methodology — Algeria Urban Congestion Index",
      ogDescription:
        "Free-flow baselines, gridlock-equivalent load and the congestion scale explained.",
    },
  },
};

export type Messages = typeof en;
