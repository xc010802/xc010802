// server/utils/db.ts
import initSqlJs from 'sql.js'

let db: any = null
let SQL: any = null

export async function getDb() {
  if (!SQL) {
    SQL = await initSqlJs()
  }
  
  if (!db) {
    db = new SQL.Database()
    
    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nickname TEXT DEFAULT '博主',
        avatar TEXT DEFAULT '/uploads/default-avatar.svg',
        bio TEXT DEFAULT '全栈开发者 / 开源爱好者 / 终身学习者',
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // 创建文章表
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        cover TEXT DEFAULT '',
        tags TEXT DEFAULT '[]',
        status TEXT DEFAULT 'draft',
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME
      )
    `)
    
    // 创建验证码表
    db.run(`
      CREATE TABLE IF NOT EXISTS email_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ 数据库初始化完成')
  }
  
  return {
    prepare: (sql: string) => ({
      run: (...params: any[]) => {
        db.run(sql, params)
        // 获取 last_insert_rowid
        const result = db.exec('SELECT last_insert_rowid() as id')
        const lastInsertRowid = result[0]?.values[0]?.[0] || 0
        return { changes: db.getRowsModified(), lastInsertRowid }
      },
      get: (...params: any[]) => {
        const stmt = db.prepare(sql)
        stmt.bind(params)
        if (stmt.step()) {
          const cols = stmt.getColumnNames()
          const vals = stmt.get()
          const row: any = {}
          cols.forEach((c: string, i: number) => row[c] = vals[i])
          stmt.free()
          return row
        }
        stmt.free()
        return undefined
      },
      all: (...params: any[]) => {
        const results: any[] = []
        const stmt = db.prepare(sql)
        stmt.bind(params)
        while (stmt.step()) {
          const cols = stmt.getColumnNames()
          const vals = stmt.get()
          const row: any = {}
          cols.forEach((c: string, i: number) => row[c] = vals[i])
          results.push(row)
        }
        stmt.free()
        return results
      },
    }),
    exec: (sql: string) => {
      db.run(sql)
    }
  }
}

// 导出初始化函数
export async function initDb() {
  await getDb()
}