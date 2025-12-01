import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

// Configuration
const ROOT_DIR = __dirname;
const EXCLUDE_DIRS = ['node_modules', '.git', '.angular', 'dist'];
const FILE_EXTENSIONS = ['.ts', '.js'];
const DEBUG = false;

// Regex to match import statements
const IMPORT_REGEX = /^import\s*{([^}]*)}\s*from\s*['"]([^'"]+)['"];?$/gm;
const SINGLE_IMPORT_REGEX = /^import\s+([^{\s][^\s]*)['"];?$/gm;

// Track statistics
let filesProcessed = 0;
let importsFormatted = 0;
let filesSkipped = 0;

async function formatFileImports(filePath: string): Promise<void> {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;

    // Process multi-line imports
    content = content.replace(IMPORT_REGEX, (match, imports, from) => {
      // Skip if already formatted
      if (match.includes('\n')) {
        return match;
      }

      const importItems = imports
        .split(',')
        .map((i: string) => i.trim())
        .filter(Boolean);

      if (importItems.length <= 1) {
        return match; // Skip single imports
      }

      const maxImportLength = Math.max(...importItems.map((i: string) => i.length));
      const formattedImports = importItems
        .map((item: string, index: number) => {
          const isLast = index === importItems.length - 1;
          const padding = ' '.repeat(maxImportLength - item.length);
          return `  ${item}${isLast ? '' : ','}${padding}`;
        })
        .join('\n');

      const formattedImport = `import {
${formattedImports}
} from '${from}';`;

      modified = true;
      importsFormatted++;
      return formattedImport;
    });

    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      if (DEBUG) console.log(`Formatted imports in: ${filePath}`);
    }

    filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    filesSkipped++;
  }
}

async function processDirectory(directory: string): Promise<void> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          await processDirectory(fullPath);
        }
        continue;
      }

      // Process only files with specified extensions
      if (FILE_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
        await formatFileImports(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
  }
}

async function main() {
  console.log('Starting import formatting...');
  const startTime = Date.now();
  
  await processDirectory(ROOT_DIR);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\nImport formatting completed!');
  console.log(`Processed ${filesProcessed} files in ${duration}s`);
  console.log(`Formatted imports in ${importsFormatted} files`);
  console.log(`Skipped ${filesSkipped} files due to errors`);
}

main().catch(console.error);
