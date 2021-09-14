// For testing out lat/long generation math
let total = 65341;
total = 181;
const allLongs = [];
for (let i = 1; i < total; i++) {
  const lat = i / 361;
  const lon = i % 361;
  const lonMod = lon % 19
  const lonOffset = (lon + lonMod * 19) % 360
  allLongs.push(lonOffset)

  console.log(`${parseInt(lonOffset - 180)}, ${parseInt(lat - 90)}`);
}

console.log(allLongs.sort())
