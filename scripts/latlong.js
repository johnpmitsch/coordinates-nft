// For testing out lat/long generation math
//const total = 65341; // 181 * 361
//const total = 65340; // 181 * 361
const total = 45; // 5 * 9
//const chunks = 3439; // a number that is a divisor of a total
//const chunks = 3630; // a number that is a divisor of a total
const chunks = 5;
const offsetMultiplier = total / chunks;
//const totalLons = 361;
const totalLons = 9;
//const latOffset = 90;
const latOffset = 3;
//const lonOffset = 180;
const lonOffset = 4;
const allTotals = [];
const allLats = [];
const allLons = [];

// The coordinates are split into chunks that will be iterated through
for (let i = 0; i < total; i++) {
  console.log("---");
  const chunkIndex = i % offsetMultiplier; // offset of which chunk you are in
  const base = chunks * chunkIndex; // base that the counter is added to
  const counter = Math.floor(i / offsetMultiplier); // cycled through numbers relative to chunk size
  const offsetMint = base + counter; // new mint number deduced from offsetting the original

  const ulat = Math.floor(offsetMint / totalLons);
  const ulon = Math.floor(offsetMint % totalLons);
  const lat = ulat - latOffset;
  const lon = ulon - lonOffset;
  console.log({
    i,
    chunkIndex,
    offsetMultiplier,
    base,
    offsetMint,
    counter,
    lat,
    lon,
  });

  allLats.push(lat);
  allLons.push(lon);
}

const countArr = (arr) => {
  const counts = {};
  for (const num of arr) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
};

console.table(countArr(allLats.sort((a, b) => b - a)));
console.table(countArr(allLons.sort((a, b) => b - a)));
