import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const musicsDir = path.join(process.cwd(), 'public', 'musics')
    const files = fs.readdirSync(musicsDir)

    const allowed = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.flac'])
    const tracks = files
      .filter((f) => allowed.has(path.extname(f).toLowerCase()))
      .map((f) => {
        const name = path.parse(f).name
        return {
          title: name.replace(/[-_]+/g, ' '),
          src: `/musics/${f}`,
        }
      })

    return NextResponse.json({ tracks })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ tracks: [] }, { status: 200 })
  }
}
