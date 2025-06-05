let pairings = [];
let currentIndex = 0;
let results = {};

async function loadPairings() {
  const res = await fetch("pairings.json");
  const data = await res.json();
  pairings = generatePairwiseCombinations(data);
  showNextPair();
}

function generatePairwiseCombinations(items) {
  let pairs = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i], items[j]]);
    }
  }
  return shuffle(pairs);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showNextPair() {
  if (currentIndex >= pairings.length) {
    // Sort the results object by value
    const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
    localStorage.setItem("pairResults", JSON.stringify(sorted));
    window.location.href = "result.html";
    return;
  }

  const [leftPair, rightPair] = pairings[currentIndex];

  const left = document.getElementById("left-img");
  const right = document.getElementById("right-img");

  left.src = `images/${leftPair.file}`;
  left.alt = leftPair.name;
  right.src = `images/${rightPair.file}`;
  right.alt = rightPair.name;

  document.getElementById("left-option").onclick = () => choose(leftPair.name);
  document.getElementById("right-option").onclick = () => choose(rightPair.name);
}

function choose(name) {
  results[name] = (results[name] || 0) + 1;
  currentIndex++;
  showNextPair();
}

loadPairings();
