// Supabase client setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://bjsfuzlsunepfbezniey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc2Z1emxzdW5lcGZiZXpuaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzYwMzMsImV4cCI6MjA2NDcxMjAzM30.-kjszBCPdEJHiFcFTQqLh0TUgmSj3Jo4oOb0rH336vI';
const supabase = createClient(supabaseUrl, supabaseKey);

// URL SUPERBASE
const params = new URLSearchParams(window.location.search);
localStorage.setItem("username", params.get("u") || "anonymous");
localStorage.setItem("submission_link", params.get("s") || "");

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

async function showNextPair() {
  if (currentIndex >= pairings.length) {
    const sorted = Object.entries(results)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const topChoice = sorted[0];
    const username = localStorage.getItem("username") || "anonymous";
    const submission_link = localStorage.getItem("submission_link") || "";

    await supabase.from('result').insert([
      {
        username,
        top_choice: topChoice,
        ranking: sorted,
        submission_link
      }
    ]);

    localStorage.setItem("pairResults", JSON.stringify(sorted));
    window.location.href = "result.html";
    return;
  }

  const [leftPair, rightPair] = pairings[currentIndex];

  // ✅ Picture fixed
  if (!leftPair?.file || !rightPair?.file) {
    console.error("Missing image file for:", leftPair, rightPair);
    currentIndex++;
    showNextPair();
    return;
  }

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
