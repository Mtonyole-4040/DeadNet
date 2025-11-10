// --- Simple “AI-like” converter + soul profiler (heuristic) ---
// This is a local demo to show the DeadNet concept visually.
// In your write-up, explain that full AI conversion is handled via Kiro/specs/hooks.

const oldCodeEl = document.getElementById('oldCode');
const originalOut = document.getElementById('originalOut');
const modernOut = document.getElementById('modernOut');
const soulProfile = document.getElementById('soulProfile');
const fileInput = document.getElementById('fileInput');
const reviveBtn = document.getElementById('reviveBtn');

// Quick sample snippets to click
const sampleLibrary = [
  {
    label: 'Python 2 → Python 3',
    code: 'print "Hello, world!"\nprint "Sum:", 1+2'
  },
  {
    label: 'Old JS → Modern JS',
    code: 'var x = 1;\nfunction sum(a, b){ return a + b }\nconsole.log("Total: " + sum(2,3));'
  },
  {
    label: 'Old PHP MySQL → PDO',
    code: '$link = mysql_connect("localhost", "user", "pass");\nmysql_select_db("db");\n$result = mysql_query("SELECT * FROM users");'
  },
  {
    label: 'VB6 → C#-style pseudo',
    code: 'Dim i As Integer\ni = 0\nDo While i < 10\n  Print i\n  i = i + 1\nLoop'
  }
];

document.getElementById('samples').innerHTML = sampleLibrary
  .map((s, i) => `<button data-i="${i}">${s.label}</button>`).join('');
document.getElementById('samples').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const idx = Number(e.target.getAttribute('data-i'));
    oldCodeEl.value = sampleLibrary[idx].code;
  }
});

// File upload -> put in textarea
fileInput.addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const text = await f.text();
  oldCodeEl.value = text;
});

reviveBtn.addEventListener('click', () => {
  const input = oldCodeEl.value.trim();
  if (!input) {
    alert('Paste or upload some legacy code first.');
    return;
  }
  originalOut.textContent = input;

  // Detect "legacy" flavor
  const flavor = detectFlavor(input);
  // Convert code (heuristic transformations)
  const modernized = convertToModern(input, flavor);
  modernOut.textContent = modernized;

  // Build the Digital Soul Profile
  soulProfile.innerHTML = renderSoulProfile(input, modernized, flavor);
});

function detectFlavor(code) {
  const c = code.toLowerCase();
  if (c.includes('print "') || c.includes('xrange') || c.includes('raw_input')) return 'python2';
  if (c.includes('var ') || c.includes('function(') || c.includes('function ')) return 'oldjs';
  if (c.includes('mysql_query') || c.includes('mysql_connect')) return 'oldphp';
  if (c.includes('dim ') || c.includes('print ') && c.includes('loop')) return 'vb6';
  if (c.includes('display') && c.includes('accept')) return 'cobol?';
  return 'generic';
}

function convertToModern(code, flavor) {
  let out = code;

  if (flavor === 'python2') {
    // print "x" -> print("x")
    out = out.replace(/print\s+"([^"]*)"/g, 'print("$1")');
    // print "x", y -> print("x", y)
    out = out.replace(/print\s+("[^"]*"),\s*([^\n]+)/g, 'print($1, $2)');
    out = out.replace(/xrange\(/g, 'range(');
    out = out.replace(/raw_input\(/g, 'input(');
    out = '# Modernized to Python 3\n' + out;
  }

  if (flavor === 'oldjs') {
    out = out.replace(/\bvar\s+/g, 'let ');
    // string concat -> template literals (simple heuristic)
    out = out.replace(/"(.*?)"\s*\+\s*([a-zA-Z0-9_().]+)/g, '`$1${$2}`');
    out = out.replace(/console\.log\(\s*"(.*?)"\s*\+\s*([^)]+)\)/g, 'console.log(`$1${$2}`)');
    out = '// Modernized to ES6+\n' + out;
  }

  if (flavor === 'oldphp') {
    out = out
      .replace(/\bmysql_connect\(([^)]+)\);?/g, '// Deprecated mysql_* removed\n$pdo = new PDO("mysql:host=localhost;dbname=db", "user", "pass");')
      .replace(/\bmysql_select_db\([^)]+\);?/g, '// Using PDO DSN instead of mysql_select_db')
      .replace(/\bmysql_query\(([^)]+)\);?/g, '$stmt = $pdo->query($1);')
      .replace(/\bmysql_fetch_assoc\(([^)]+)\);?/g, '$row = $stmt->fetch(PDO::FETCH_ASSOC);');
    out = "<?php\n// Modernized to PDO\n" + out + "\n?>";
  }

  if (flavor === 'vb6') {
    // very light pseudo mapping to C#-like
    out = out
      .replace(/\bDim\s+([A-Za-z_][A-Za-z0-9_]*)\s+As\s+\w+/g, 'int $1;')
      .replace(/\bPrint\b/g, 'Console.WriteLine')
      .replace(/\bDo While\b/g, 'while')
      .replace(/\bLoop\b/g, '');
    out = "// Pseudo-modernized to C#-style\n" + out;
  }

  // Generic small improvements
  // Tabs -> 2 spaces
  out = out.replace(/\t/g, '  ');
  return out;
}

function renderSoulProfile(original, modern, flavor) {
  const stats = deriveStats(original, modern, flavor);
  return `
    <div><strong>Detected Legacy Type:</strong> ${stats.detected}</div>
    <div><strong>Estimated Era:</strong> ${stats.era}</div>
    <div><strong>Modernization Score:</strong> ${stats.score}%</div>
    <div><strong>Risk Notes:</strong> ${stats.risks.join('; ') || 'None detected'}</div>
    <div><strong>Key Upgrades:</strong>
      <ul>
        ${stats.upgrades.map(u => `<li>${u}</li>`).join('')}
      </ul>
    </div>
    <div><em>“Every line of code tells a story. DeadNet ensures those stories never die.”</em></div>
  `;
}

function deriveStats(orig, mod, flavor) {
  let detected = 'Generic legacy';
  let era = 'Unknown';
  let upgrades = [];
  let risks = [];

  if (flavor === 'python2') {
    detected = 'Python 2';
    era = '~2000–2010';
    if (orig.includes('print "')) upgrades.push('print → print()');
    if (orig.includes('xrange')) upgrades.push('xrange → range');
    if (orig.includes('raw_input')) upgrades.push('raw_input → input');
    risks.push('Manual logic verification recommended for string/IO differences');
  } else if (flavor === 'oldjs') {
    detected = 'Pre-ES6 JavaScript';
    era = '~2005–2014';
    if (orig.includes('var ')) upgrades.push('var → let/const');
    if (orig.includes('+')) upgrades.push('String concat → template literals (partial)');
    risks.push('Scope differences between var and let/const');
  } else if (flavor === 'oldphp') {
    detected = 'PHP (mysql_* era)';
    era = '~2000–2012';
    upgrades.push('mysql_* → PDO');
    upgrades.push('Query handling via prepared statements (recommended)');
    risks.push('Sanitize input & use prepared statements to avoid SQL injection');
  } else if (flavor === 'vb6') {
    detected = 'VB6';
    era = '1998–2005';
    upgrades.push('VB6 loop/print → modern C#/CLI style (pseudo)');
    risks.push('UI/event model differs significantly from modern .NET');
  } else {
    upgrades.push('Whitespace & structural cleanup');
    risks.push('Unknown legacy style — manual review advised');
  }

  // naive “score” based on how much changed
  const changeRatio = Math.min(1, Math.abs(mod.length - orig.length) / Math.max(1, orig.length));
  const score = Math.min(98, Math.round(65 + changeRatio * 30)); // playful

  return { detected, era, upgrades, risks, score };
}
