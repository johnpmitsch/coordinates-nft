// For testing out lat/long generation math
const total = 65341; // 181 * 361
const chunks = 3439; // a number that is a divisor of a total
const offsetMultiplier = total / chunks;
const allTotals = [];
const allLats = [];
const allLons = [];

// The coordinates are split into chunks that will be iterated through
for (let i = 1; i < total; i++) {
  console.log("---");
  const offset = i % offsetMultiplier;
  const fullOffset = chunks * offset;
  const counter = Math.floor((i + 1) / offsetMultiplier);
  console.log(i);
  console.log(offset);
  console.log(offsetMultiplier);
  console.log(fullOffset);
  console.log(offsetMultiplier);
  const offsetMint = fullOffset + counter + 1;
  console.log(offsetMint);

  const ulat = offsetMint / 361;
  const ulon = offsetMint % 361;
  const lat = Math.ceil(ulat - 91);
  const lon = Math.ceil(ulon - 180);
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
