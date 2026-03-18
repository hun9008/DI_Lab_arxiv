import mysql, { type Pool } from "mysql2/promise"

declare global {
  var __mysqlPool: Pool | undefined
  var __mysqlPoolConfigKey: string | undefined
}

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required database environment variable: ${name}`)
  }

  return value
}

export function getPool() {
  const config = {
    host: requireEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? "3306"),
    user: requireEnv("MYSQL_USER"),
    password: requireEnv("MYSQL_PASSWORD"),
    database: requireEnv("MYSQL_DATABASE"),
  }

  const configKey = JSON.stringify(config)

  if (global.__mysqlPool && global.__mysqlPoolConfigKey !== configKey) {
    void global.__mysqlPool.end()
    global.__mysqlPool = undefined
  }

  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    })
    global.__mysqlPoolConfigKey = configKey
  }

  return global.__mysqlPool
}
