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
    const sorted = Object.entries(results)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    localStorage.setItem("pairResults", JSON.stringify(sorted));
    window.location.href = "result.html";
    return;
  }

  const [leftPair, rightPair] = pairings[currentIndex];

  const leftImg = document.getElementById("left-img");
  const rightImg = document.getElementById("right-img");

  const leftLabel = document.getElementById("left-label");
  const rightLabel = document.getElementById("right-label");

  // Update images
  leftImg.src = `images/${leftPair.file}`;
  leftImg.alt = leftPair.name;
  rightImg.src = `images/${rightPair.file}`;
  rightImg.alt = rightPair.name;

  // Update labels
  leftLabel.textContent = leftPair.name;
  rightLabel.textContent = rightPair.name;

  // Set click events
  document.getElementById("left-option").onclick = () => choose(leftPair.name);
  document.getElementById("right-option").onclick = () => choose(rightPair.name);
}

function choose(name) {
  results[name] = (results[name] || 0) + 1;
  currentIndex++;
  showNextPair();
}

loadPairings();
