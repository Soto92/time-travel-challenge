function distanceAU(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function estimateEnvelopeKm(boundingBox) {
  const [south, north, west, east] = boundingBox;
  // approximation: 1 degree ≈ 111 km
  const latKm = Math.abs(north - south) * 111;
  const lonKm = Math.abs(east - west) * 111;
  return Math.max(latKm, lonKm) / 2;
}

async function geocodeCity(cityName) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(cityName)}` +
    `&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "AeonTemporalNavigator/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to geocode city");
  }

  const data = await res.json();
  if (!data.length) {
    throw new Error("City not found");
  }

  const city = data[0];

  return {
    lat: parseFloat(city.lat),
    lon: parseFloat(city.lon),
    boundingBox: city.boundingbox.map(Number), // [S, N, W, E]
  };
}

function parseEarthVector(lines, startIndex) {
  const block = lines.slice(startIndex, startIndex + 10).join("\n");

  const x = block.match(/X\s*=\s*([-\d.E+]+)/);
  const y = block.match(/Y\s*=\s*([-\d.E+]+)/);
  const z = block.match(/Z\s*=\s*([-\d.E+]+)/);

  if (!x || !y || !z) {
    throw new Error("Failed to parse Earth position");
  }

  return {
    x: parseFloat(x[1]),
    y: parseFloat(y[1]),
    z: parseFloat(z[1]),
  };
}

async function getEarthHeliocentricPosition(dateISO) {
  const params = new URLSearchParams({
    format: "json",
    COMMAND: "'399'",
    CENTER: "'500@0'",
    EPHEM_TYPE: "V",
    VEC_TABLE: "2",
    START_TIME: dateISO,
    STOP_TIME: new Date(Date.parse(dateISO) + 86400000).toISOString(),
    STEP_SIZE: "1d",
    REF_SYSTEM: "ICRF",
    OUT_UNITS: "AU",
  });

  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch Earth position from NASA");
  }
  const data = await res.json();
  const lines = data?.result?.split("\n");
  if (!lines) {
    throw new Error("Invalid NASA response");
  }

  const start = lines.findIndex((l) => l.includes("$$SOE"));
  const end = lines.findIndex((l) => l.includes("$$EOE"));

  if (start === -1 || end === -1) {
    throw new Error("No ephemeris data found");
  }

  return parseEarthVector(lines, start);
}

async function findSafeTemporalWindows(cityName, targetYear) {
  const city = await geocodeCity(cityName);
  const envelopeKm = estimateEnvelopeKm(city.boundingBox);
  const toleranceAU = envelopeKm / 150_000_000;

  const nowPos = await getEarthHeliocentricPosition(new Date().toISOString());

  const SEARCH_RANGE = 20;

  let bestPast = null;
  let bestFuture = null;

  for (let offset = 1; offset <= SEARCH_RANGE; offset++) {
    const pastYear = targetYear - offset;
    const pastDate = `${pastYear}-06-15T12:00:00Z`;

    try {
      const pos = await getEarthHeliocentricPosition(pastDate);
      const drift = distanceAU(nowPos, pos);
      const score = drift / toleranceAU + offset * 0.1;

      if (!bestPast || score < bestPast.score) {
        bestPast = {
          date: pastDate,
          year: pastYear,
          temporalErrorYears: -offset,
          spatialDriftAU: drift,
          score,
        };
      }
    } catch (_) {}

    const futureYear = targetYear + offset;
    const futureDate = `${futureYear}-06-15T12:00:00Z`;

    try {
      const pos = await getEarthHeliocentricPosition(futureDate);
      const drift = distanceAU(nowPos, pos);
      const score = drift / toleranceAU + offset * 0.1;

      if (!bestFuture || score < bestFuture.score) {
        bestFuture = {
          date: futureDate,
          year: futureYear,
          temporalErrorYears: offset,
          spatialDriftAU: drift,
          score,
        };
      }
    } catch (_) {}
  }

  return {
    status: "OK",
    city: cityName,
    requestedYear: targetYear,
    safeTemporalWindows: [bestPast, bestFuture],
  };
}

// Example usage:
const result = await findSafeTemporalWindows("Gravataí, RS, Brazil", 1910);
console.log(result);

/**
 * {
  status: 'OK',
  city: 'Gravataí, RS, Brazil',
  requestedYear: 1910,
  safeTemporalWindows: [
    {
      date: '1906-06-15T12:00:00Z',
      year: 1906,
      temporalErrorYears: -4,
      spatialDriftAU: 1.8880109678404888,
      score: 17620157.651715036
    },
    {
      date: '1926-06-15T12:00:00Z',
      year: 1926,
      temporalErrorYears: 16,
      spatialDriftAU: 1.9615349873542485,
      score: 18306333.247773986
    }
  ]
}
 */
