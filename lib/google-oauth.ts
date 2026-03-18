import fs from "node:fs"
import path from "node:path"

interface GoogleWebClientConfig {
  client_id: string
  client_secret: string
}

interface GoogleClientSecretFile {
  web?: GoogleWebClientConfig
}

function readGoogleClientSecretFile() {
  const configuredPath = process.env.GOOGLE_CLIENT_SECRET_FILE
  const candidates = configuredPath
    ? [configuredPath]
    : fs
        .readdirSync(process.cwd())
        .filter((file) => file.startsWith("client_secret_") && file.endsWith(".json"))

  for (const candidate of candidates) {
    const absolutePath = path.isAbsolute(candidate)
      ? candidate
      : path.join(process.cwd(), candidate)

    if (!fs.existsSync(absolutePath)) continue

    const parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8")) as GoogleClientSecretFile
    if (parsed.web?.client_id && parsed.web?.client_secret) {
      return parsed.web
    }
  }

  return null
}

export function getGoogleOAuthCredentials() {
  const fileConfig = readGoogleClientSecretFile()
  const clientId = process.env.GOOGLE_CLIENT_ID ?? fileConfig?.client_id
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? fileConfig?.client_secret

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET or provide a client_secret_*.json file.")
  }

  return {
    clientId,
    clientSecret,
  }
}
