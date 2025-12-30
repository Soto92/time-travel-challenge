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

async function getEarthHeliocentricPosition(dateISO) {
  return {
    x: Math.sin(Date.parse(dateISO) / 1e11),
    y: Math.cos(Date.parse(dateISO) / 1e11),
    z: Math.sin(Date.parse(dateISO) / 1e12),
  };
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
