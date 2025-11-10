# DeadNet – Kiro Agent Hooks

These hooks describe the automated steps Kiro runs during a “resurrection”.

## 1) hook_detect_legacy
- **Trigger:** on file upload or paste
- **Input:** raw code (string)
- **Output:** `legacy_type` (python2 | oldjs | oldphp | vb6 | cobol? | generic)
- **Logic:** pattern scan (e.g., `print "x"`, `mysql_*`, `var `, `Dim ... As`, `DISPLAY/ACCEPT`)
- **Next:** `hook_transform_code`

## 2) hook_transform_code
- **Trigger:** after `hook_detect_legacy`
- **Input:** raw code + `legacy_type`
- **Output:** modernized code (string)
- **Logic examples:**
  - python2 → python3: `print "x"` → `print("x")`, `xrange` → `range`
  - oldjs → ES6+: `var` → `let/const`, concat → template literals
  - oldphp → PDO: `mysql_*` → `PDO` statements
  - vb6 → C#-style pseudo: loops/print remapped
- **Next:** `hook_build_soul_profile`

## 3) hook_build_soul_profile
- **Trigger:** after `hook_transform_code`
- **Input:** original + modernized + `legacy_type`
- **Output:** JSON summary:
  - estimated era
  - modernization score
  - risks (e.g., scope, SQL injection)
  - key upgrades (bullets)
- **Next:** `hook_generate_report`

## 4) hook_generate_report
- **Trigger:** after `hook_build_soul_profile`
- **Output:** Before/After diff + Soul Profile markdown
- **Persistance:** optional save to “Digital Heritage Vault” (future)

## 5) hook_ui_notify
- **Trigger:** on success/error
- **Output:** user message with short spooky line
- **Examples:** 
  - Success: “💀 *The code breathes again.*”
  - Error: “🕯️ *This soul resists—try a smaller snippet.*”

> Note: In this repo, hooks are simulated in `script.js` for demo speed. Full AI runs inside Kiro.
