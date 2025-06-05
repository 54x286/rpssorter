
import { createClient } from '[https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm](https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm)';

const supabaseUrl = '[https://bjsfuzlsunepfbezniey.supabase.co](https://bjsfuzlsunepfbezniey.supabase.co)';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc2Z1emxzdW5lcGZiZXpuaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzYwMzMsImV4cCI6MjA2NDcxMjAzM30.-kjszBCPdEJHiFcFTQqLh0TUgmSj3Jo4oOb0rH336vI';
const supabase = createClient(supabaseUrl, supabaseKey);

const params = new URLSearchParams(window.location.search);
localStorage.setItem("username", params.get("u") || "anonymous");
localStorage.setItem("submission_link", params.get("s") || "");

let pairings = [];
let currentIndex = 0;
let results = {};


async function loadPairings() {
    try {
        console.log("[DEBUG] Memulai memuat pairings.json...");
        const res = await fetch("pairings.json");
        if (!res.ok) {
            throw new Error(`Gagal memuat pairings.json: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("[DEBUG] pairings.json berhasil dimuat:", data);

        pairings = generatePairwiseCombinations(data);
        console.log("[DEBUG] Jumlah pasangan yang dihasilkan:", pairings.length);

        if (pairings.length === 0) {
            console.warn("[DEBUG] Tidak ada pasangan yang dihasilkan. Pastikan pairings.json memiliki setidaknya 2 item unik.");
        
            return; 
        }

        showNextPair();
    } catch (error) {
        console.error("[ERROR] Kesalahan saat memuat atau memproses pairings.json:", error);

    }
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

    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

  
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}


async function showNextPair() {
    // Pairings
    if (currentIndex >= pairings.length) {
        console.log("[DEBUG] Semua pasangan telah ditampilkan. Mengakhiri permainan.");
        const sorted = Object.entries(results)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        const topChoice = sorted[0] || "Tidak ada pilihan"; 
        const username = localStorage.getItem("username") || "anonymous";
        const submission_link = localStorage.getItem("submission_link") || "";

        try {
            console.log("[DEBUG] Mengirim hasil ke Supabase:", { username, top_choice: topChoice, ranking: sorted, submission_link });
            const { data, error } = await supabase.from('result').insert([
                {
                    username,
                    top_choice: topChoice,
                    ranking: sorted, 
                    submission_link
                }
            ]);

            if (error) {
                throw error;
            }
            console.log("[DEBUG] Hasil berhasil dikirim ke Supabase:", data);
        } catch (error) {
            console.error("[ERROR] Gagal mengirim hasil ke Supabase:", error.message);
     
        }

        localStorage.setItem("pairResults", JSON.stringify(sorted));
        console.log("[DEBUG] Mengalihkan ke result.html");
        window.location.href = "result.html";
        return;
    }

    const [leftPair, rightPair] = pairings[currentIndex];
    console.log("[DEBUG] Menampilkan pasangan:", leftPair.name, "vs", rightPair.name);


    const leftImgSrc = leftPair?.file ? `images/${leftPair.file}` : '[https://placehold.co/300x300/CCCCCC/FFFFFF?text=No+Image](https://placehold.co/300x300/CCCCCC/FFFFFF?text=No+Image)';
    const rightImgSrc = rightPair?.file ? `images/${rightPair.file}` : '[https://placehold.co/300x300/CCCCCC/FFFFFF?text=No+Image](https://placehold.co/300x300/CCCCCC/FFFFFF?text=No+Image)';

    const leftOption = document.getElementById("left-option");
    const rightOption = document.getElementById("right-option");

    const leftImg = leftOption?.querySelector("img");
    const rightImg = rightOption?.querySelector("img");

    if (leftImg && rightImg) {
        leftImg.src = leftImgSrc;
        leftImg.alt = leftPair.name;
        rightImg.src = rightImgSrc;
        rightImg.alt = rightPair.name;
        console.log("[DEBUG] URL Gambar Kiri:", leftImg.src);
        console.log("[DEBUG] URL Gambar Kanan:", rightImg.src);
    } else {
        console.error("[ERROR] Elemen gambar tidak ditemukan di HTML.");
      
        return;
    }


    if (leftOption && rightOption) {
        leftOption.onclick = () => choose(leftPair.name);
        rightOption.onclick = () => choose(rightPair.name);
        console.log("[DEBUG] Event listeners terpasang.");
    } else {
        console.error("[ERROR] Elemen opsi (div.option) tidak ditemukan di HTML.");
    }
}


function choose(name) {
    results[name] = (results[name] || 0) + 1;
    currentIndex++;
    console.log(`[DEBUG] Pilihan: ${name}. Skor saat ini: ${results[name]}. Index saat ini: ${currentIndex}`);
    showNextPair();
}

loadPairings();
