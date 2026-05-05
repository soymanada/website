// Elimina archivos desktop.ini que Windows crea en directorios git
const fs = require('fs')
const path = require('path')

function clean(dir) {
  if (!fs.existsSync(dir)) return
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        clean(full)
      } else if (entry.name.toLowerCase() === 'desktop.ini') {
        fs.unlinkSync(full)
        console.log('Removed:', full)
      }
    }
  } catch (_) {}
}

clean('.git/refs')
clean('node_modules/.cache/gh-pages')
