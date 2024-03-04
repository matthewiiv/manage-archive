import console from 'console'
import 'dotenv/config'
import { Dropbox, files } from 'dropbox'
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'fs'

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN })

async function getFolders(): Promise<files.ListFolderResult['entries']> {
  const folders = await dbx.filesListFolder({
    path: '/Pictures & Videos'
  })
  if (folders.status !== 200) {
    throw new Error('No folders found')
  }
  return folders.result.entries.filter((entry) => entry.name.includes('20'))
}

async function checkIfFolderExists(path: string): Promise<void> {
  try {
    await dbx.filesListFolder({ path })
  } catch (e: any) {
    if (e?.error?.error?.['.tag'] === 'path') {
      console.log(`***Folder does not exist for ${path}***`)
    }
  }
}

async function checkFoldersForFile(filename: string): Promise<void> {
  console.log(`Checking file: ${filename}`)
  const folders = await getFolders()
  for (const folder of folders) {
    try {
      const response = await dbx.filesGetMetadata({
        path: (folder.path_display ?? '') + '/All/' + filename
      })
      console.log(
        `---${filename} already exists in ${response.result.path_display}---`
      )
      return
    } catch (e: any) {
      if (e?.error?.error?.['.tag'] === 'path') {
        continue
      }
    }
  }
  console.log(`===${filename} is new===`)
  copyFileSync(
    `src/check-dropbox/candidate-photos/${filename}`,
    `src/check-dropbox/new-photos/${filename}`
  )
}

async function checkFileExists(): Promise<void> {
  const folders = await getFolders()

  for (const folder of folders) {
    await checkIfFolderExists(folder.path_display ?? '' + '/All')
    await checkIfFolderExists(folder.path_display ?? '' + '/Favourites')
  }

  const candidatePhotos = readdirSync('src/check-dropbox/candidate-photos')
  try {
    rmSync('src/check-dropbox/new-photos', { recursive: true })
  } catch (e) {
    console.log('No new photos folder to delete. Creating new folder.')
  }

  mkdirSync('src/check-dropbox/new-photos')

  for (const photo of candidatePhotos) {
    await checkFoldersForFile(photo)
  }
}

checkFileExists()
  .then(() => process.exit())
  .catch(console.error)
