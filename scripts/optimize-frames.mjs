import { readdir, rename, stat } from 'fs/promises'
import { join, extname } from 'path'
import { execSync } from 'child_process'

const FRAMES_DIR = join(process.cwd(), 'public/assets/frames')
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png'])

async function optimizeFrames() {
  try {
    const files = await readdir(FRAMES_DIR)
    const images = files.filter(f => EXTENSIONS.has(extname(f).toLowerCase()))
    
    console.log(`Found ${images.length} frame images to optimize`)
    
    let totalSaved = 0
    for (const file of images) {
      const filePath = join(FRAMES_DIR, file)
      const before = (await stat(filePath)).size
      
      try {
        execSync(`npx sharp-cli resize ${filePath} -o ${filePath} --quality 80`, {
          stdio: 'pipe',
          timeout: 10000,
        })
      } catch {
        try {
          execSync(`magick convert "${filePath}" -quality 80 "${filePath}"`, {
            stdio: 'pipe',
            timeout: 10000,
          })
        } catch {
          console.log(`  Skipped ${file} (no image tools available)`)
        }
      }
      
      const after = (await stat(filePath)).size
      const saved = before - after
      totalSaved += saved
      if (saved > 0) {
        console.log(`  ${file}: ${(before/1024).toFixed(1)}KB → ${(after/1024).toFixed(1)}KB (saved ${(saved/1024).toFixed(1)}KB)`)
      }
    }
    
    console.log(`\nTotal saved: ${(totalSaved/1024/1024).toFixed(1)}MB`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Frames directory not found. Skipping optimization.')
    } else {
      console.error('Error:', err.message)
    }
  }
}

optimizeFrames()
