// scripts/copy-duckdb-worker.js
const fs = require('fs-extra');
const path = require('path');

const duckDBWasmDist = path.dirname(require.resolve('@duckdb/duckdb-wasm'));
const targetDir = path.resolve(__dirname, '../public');

console.log('COPY SCRIPT: Source DuckDB WASM dist path:', duckDBWasmDist); // ADD THIS
console.log('COPY SCRIPT: Target public directory:', targetDir); // ADD THIS

async function copyDuckDBFiles() {
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const filesToCopy = [
        'duckdb-mvp.wasm',
        'duckdb-browser-mvp.worker.js',
        'duckdb-eh.wasm',
        'duckdb-browser-eh.worker.js'
    ];

    for (const file of filesToCopy) {
        const sourcePath = path.join(duckDBWasmDist, file);
        const targetPath = path.join(targetDir, file);
        console.log(`COPY SCRIPT: Attempting to copy ${sourcePath} to ${targetPath}`); // ADD THIS
        if (fs.existsSync(sourcePath)) {
            await fs.copy(sourcePath, targetPath, { overwrite: true }); // Ensure overwrite
            console.log(`COPY SCRIPT: Successfully copied ${file}`); // ADD THIS
        } else {
            console.error(`COPY SCRIPT: Source file NOT FOUND: ${sourcePath}`); // ADD THIS
        }
    }
    // ... (rest of your copy logic, ensure all necessary files are listed) ...
    console.log('COPY SCRIPT: Successfully copied DuckDB WASM worker files to public folder.');
  } catch (err) {
    console.error('COPY SCRIPT: Error copying DuckDB WASM worker files:', err);
    process.exit(1);
  }
}
copyDuckDBFiles();
