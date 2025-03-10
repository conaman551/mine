const { queryDatabase } = require('./db');

async function calcOriginDistance(lat, lng) {
  query = `
SELECT *,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(
      ST_X(origincoordinates::geometry), 
      ST_Y(origincoordinates::geometry)
    ), 4326)::geography,
    ST_SetSRID(ST_MakePoint($1,$2), 4326)::geography
  ) AS distancex
FROM ride
WHERE seats > 0 AND status = 'scheduled' AND ST_DWithin(
  ST_SetSRID(ST_MakePoint(
    ST_X(origincoordinates::geometry), 
    ST_Y(origincoordinates::geometry)
  ), 4326)::geography,
  ST_SetSRID(ST_MakePoint($1,$2), 4326)::geography,
  30000);`
  requirements = [lat, lng]
  const response = await queryDatabase(query, requirements)
  return response
}


async function calcDestDistance(lat, lng) {
  query = `
SELECT *,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(
      ST_X(destinationcoordinates::geometry), 
      ST_Y(destinationcoordinates::geometry)
    ), 4326)::geography,
    ST_SetSRID(ST_MakePoint($1,$2), 4326)::geography
  ) AS distancey
FROM ride
WHERE seats > 0 AND status = 'scheduled' AND ST_DWithin(
  ST_SetSRID(ST_MakePoint(
    ST_X(destinationcoordinates::geometry), 
    ST_Y(destinationcoordinates::geometry)
  ), 4326)::geography,
  ST_SetSRID(ST_MakePoint($1,$2), 4326)::geography,
  30000);`
  requirements = [lat, lng]
  const response = await queryDatabase(query, requirements)
  return response
}

module.exports = {
  calcOriginDistance,
  calcDestDistance
}