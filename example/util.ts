import { AppwriteNextServer } from 'react-appwrite-hooks/next'

export const appwrite = new AppwriteNextServer({
  url: process.env.APPWRITE_URL as string,
  projectId: process.env.APPWRITE_PROJECT_ID as string,
  key: process.env.APPWRITE_KEY as string,
})