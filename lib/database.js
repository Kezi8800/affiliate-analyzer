// lib/database.js
// BrandShuo — Database Adapter
// Unified interface for JSON file storage and Supabase PostgreSQL
// Set DB_PROVIDER=supabase in env to switch (default: json)
//
// Usage:
//   const db = require("./database");
//   await db.connect();
//   const pubs = await db.publishers.search("slickdeals");
//   await db.feedback.insert({ url, publisher_name });
//   await db.counters.increment("analyzed");

const DB_PROVIDER = process.env.DB_PROVIDER || "json";

// ===== JSON Provider =====
class JsonProvider {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.dataDir = process.env.DATA_DIR || this.path.join(process.cwd(), "data");
  }

  _ensureDir() {
    if (!this.fs.existsSync(this.dataDir)) {
      this.fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _readJson(file) {
    this._ensureDir();
    const filePath = this.path.join(this.dataDir, file);
    if (!this.fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(this.fs.readFileSync(filePath, "utf8"));
    } catch {
      return null;
    }
  }

  _writeJson(file, data) {
    this._ensureDir();
    this.fs.writeFileSync(this.path.join(this.dataDir, file), JSON.stringify(data, null, 2));
  }

  _appendJsonl(file, entry) {
    this._ensureDir();
    this.fs.appendFileSync(
      this.path.join(this.dataDir, file),
      JSON.stringify({ ...entry, saved_at: new Date().toISOString() }) + "\n"
    );
  }

  _readJsonl(file, limit = 100) {
    this._ensureDir();
    const filePath = this.path.join(this.dataDir, file);
    if (!this.fs.existsSync(filePath)) return [];
    const content = this.fs.readFileSync(filePath, "utf8");
    return content.trim().split("\n").filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean).slice(-limit).reverse();
  }

  async connect() { return true; }

  // Publishers
  get publishers() {
    const self = this;
    return {
      getAll() {
        return require("./publisher-database").PUBLISHERS;
      },
      getById(id) {
        return require("./publisher-database").getPublisherById(id);
      },
      search(q, filters = {}) {
        const pubs = require("./publisher-database").PUBLISHERS;
        let results = pubs.filter(p => p.id && p.publisher);
        if (q) {
          const lower = q.toLowerCase();
          results = results.filter(p =>
            [p.publisher, p.name, p.group, ...(p.aliases || []), ...(p.domains || [])]
              .join(" ").toLowerCase().includes(lower)
          );
        }
        if (filters.category) results = results.filter(p => p.category === filters.category);
        if (filters.network) results = results.filter(p => (p.networks || []).some(n => n.toLowerCase().includes(filters.network)));
        if (filters.region) results = results.filter(p => (p.region || "").toUpperCase() === filters.region.toUpperCase());
        return results;
      },
      count() {
        return require("./publisher-database").PUBLISHERS.filter(p => p.id && p.publisher).length;
      }
    };
  }

  // Feedback
  get feedback() {
    const self = this;
    return {
      insert(entry) {
        self._appendJsonl("feedback.jsonl", entry);
      },
      getRecent(limit = 50) {
        return self._readJsonl("feedback.jsonl", limit);
      },
      count() {
        self._ensureDir();
        const fp = self.path.join(self.dataDir, "feedback.jsonl");
        if (!self.fs.existsSync(fp)) return 0;
        return self.fs.readFileSync(fp, "utf8").trim().split("\n").filter(Boolean).length;
      }
    };
  }

  // Counters
  get counters() {
    const self = this;
    return {
      _load() {
        return self._readJson("counters.json") || { analyzed: 0, batch_analyzed: 0, feedback_submitted: 0, publishers_detected: {}, networks_detected: {} };
      },
      _save(data) {
        self._writeJson("counters.json", data);
      },
      increment(key, subKey) {
        const c = this._load();
        if (subKey) {
          c[key] = c[key] || {};
          c[key][subKey] = (c[key][subKey] || 0) + 1;
        } else {
          c[key] = (c[key] || 0) + 1;
        }
        this._save(c);
      },
      get() {
        return this._load();
      }
    };
  }
}

// ===== Supabase Provider (ready for production) =====
class SupabaseProvider {
  constructor() {
    this.client = null;
  }

  async connect() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      console.warn("Supabase credentials not set. Falling back to JSON storage.");
      return false;
    }

    try {
      const { createClient } = require("@supabase/supabase-js");
      this.client = createClient(url, key);
      return true;
    } catch (err) {
      console.error("Supabase client init failed:", err.message);
      return false;
    }
  }

  get publishers() {
    const client = this.client;
    return {
      async getAll() {
        if (!client) return require("./publisher-database").PUBLISHERS;
        const { data } = await client.from("publishers").select("*");
        return data || [];
      },
      async search(q, filters = {}) {
        if (!client) {
          const pubs = require("./publisher-database").PUBLISHERS;
          return pubs.filter(p => (p.publisher || "").toLowerCase().includes((q || "").toLowerCase()));
        }
        let query = client.from("publishers").select("*");
        if (q) query = query.ilike("publisher", `%${q}%`);
        if (filters.category) query = query.eq("category", filters.category);
        if (filters.region) query = query.eq("region", filters.region.toUpperCase());
        const { data } = await query.limit(filters.limit || 50);
        return data || [];
      }
    };
  }

  get feedback() {
    const client = this.client;
    return {
      async insert(entry) {
        if (!client) return new JsonProvider().feedback.insert(entry);
        await client.from("feedback").insert({ ...entry, created_at: new Date().toISOString() });
      },
      async getRecent(limit = 50) {
        if (!client) return new JsonProvider().feedback.getRecent(limit);
        const { data } = await client.from("feedback").select("*").order("created_at", { ascending: false }).limit(limit);
        return data || [];
      },
      async count() {
        if (!client) return new JsonProvider().feedback.count();
        const { count } = await client.from("feedback").select("*", { count: "exact", head: true });
        return count || 0;
      }
    };
  }

  get counters() {
    const client = this.client;
    return {
      async increment(key, subKey) {
        if (!client) return new JsonProvider().counters.increment(key, subKey);
        // Upsert counter record
        const { data } = await client.from("counters").select("*").eq("key", key).single();
        if (data) {
          const counts = data.counts || {};
          if (subKey) {
            counts[subKey] = (counts[subKey] || 0) + 1;
          } else {
            counts._total = (counts._total || 0) + 1;
          }
          await client.from("counters").update({ counts, updated_at: new Date().toISOString() }).eq("key", key);
        } else {
          const counts = subKey ? { [subKey]: 1 } : { _total: 1 };
          await client.from("counters").insert({ key, counts });
        }
      },
      async get() {
        if (!client) return new JsonProvider().counters.get();
        const { data } = await client.from("counters").select("*");
        const result = { analyzed: 0, batch_analyzed: 0, feedback_submitted: 0, publishers_detected: {}, networks_detected: {} };
        (data || []).forEach(row => {
          if (row.counts) Object.assign(result, row.counts);
        });
        return result;
      }
    };
  }
}

// ===== Factory =====
function createDatabase() {
  if (DB_PROVIDER === "supabase") {
    return new SupabaseProvider();
  }
  return new JsonProvider();
}

const db = createDatabase();

module.exports = db;
