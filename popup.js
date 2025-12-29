const API_URL = 'https://tekzilver.com/ipintel/proxy.php';

// --- INITIALIZATION ---
document.getElementById('year').textContent = new Date().getFullYear();

const btn = document.getElementById('goBtn');
const inp = document.getElementById('targetInput');

btn.addEventListener('click', fetchData);
inp.addEventListener('keypress', (e) => { if(e.key === 'Enter') fetchData(); });

// --- MAIN LOGIC ---
async function fetchData() {
    const target = inp.value.trim();
    if (!target) return;

    btn.disabled = true;
    document.getElementById('loader').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    try {
        const response = await fetch(`${API_URL}?target=${target}`);
        const rawData = await response.json();

        if (rawData.error) throw new Error(rawData.error);

        processData(rawData);
        document.getElementById('results').style.display = 'flex';
        document.getElementById('results').style.flexDirection = 'column'; // Fix for vertical layout

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        document.getElementById('loader').style.display = 'none';
    }
}

function processData(data) {
    const ipinfo = data.ipinfo || {};
    const abuse = (data.abuse && data.abuse.data) ? data.abuse.data : null;

    // --- 1. IP Address ---
    document.getElementById('out-ip').innerText = ipinfo.ip || 'N/A';

    // --- 2. ISP / Company ---
    // Tries IPInfo AS_Name -> IPInfo Org -> AbuseIPDB ISP
    const isp = ipinfo.as_name || ipinfo.org || (abuse ? abuse.isp : 'Unknown');
    document.getElementById('out-isp').innerText = isp;

    // --- 3. Hostname ---
    // Tries IPInfo -> AbuseIPDB Hostnames Array
    const host = ipinfo.hostname || (abuse && abuse.hostnames && abuse.hostnames[0]) || 'N/A';
    document.getElementById('out-hostname').innerText = host;

    // --- 4. Location ---
    const city = ipinfo.city || '';
    const country = ipinfo.country || (abuse ? abuse.countryName : 'N/A');
    document.getElementById('out-loc').innerText = `${city} ${city ? ',' : ''} ${country}`;

    // --- 5. Quota ---
    document.getElementById('out-quota').innerText = `${data.quota_remaining} / 50`;

    // --- 6. Reputation ---
    const score = (abuse) ? abuse.abuseConfidenceScore : 0;
    const reports = (abuse) ? abuse.totalReports : 0;
    const usage = (abuse) ? abuse.usageType : 'Unknown';

    const scoreEl = document.getElementById('score-circle');
    const verdictEl = document.getElementById('score-verdict');

    scoreEl.innerText = score + "%";
    scoreEl.className = 'score-num';
    verdictEl.style.color = '#94a3b8';

    if (score === 0) {
        scoreEl.classList.add('safe');
        verdictEl.innerText = 'Clean';
        verdictEl.style.color = '#10b981';
    } else if (score < 50) {
        scoreEl.classList.add('warning');
        verdictEl.innerText = 'Suspicious';
        verdictEl.style.color = '#f59e0b';
    } else {
        scoreEl.classList.add('danger');
        verdictEl.innerText = 'Malicious';
        verdictEl.style.color = '#ef4444';
    }

    document.getElementById('out-reports').innerText = reports;
    document.getElementById('out-usage').innerText = usage;
}