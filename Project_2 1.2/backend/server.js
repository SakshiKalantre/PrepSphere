const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

const connectionString = process.env.DATABASE_URL || 'postgresql://user:Swapnil%402102@localhost:5432/Project_2';
const dbClient = new Client({ connectionString });

dbClient.connect().then(() => {
  console.log('✓ Connected to PostgreSQL database');
  dbClient.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alternate_email VARCHAR(255);')
    .then(()=>console.log('✓ Ensured profiles.alternate_email column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_status VARCHAR(50);')
    .then(()=>console.log('✓ Ensured profiles.placement_status column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;')
    .then(()=>console.log('✓ Ensured file_uploads.is_verified column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS verified_by INTEGER;')
    .then(()=>console.log('✓ Ensured file_uploads.verified_by column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS verification_notes TEXT;')
    .then(()=>console.log('✓ Ensured file_uploads.verification_notes column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS file_url VARCHAR(255);')
    .then(()=>console.log('✓ Ensured file_uploads.file_url column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;')
    .then(()=>console.log('✓ Ensured jobs.location column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary TEXT;')
    .then(()=>console.log('✓ Ensured jobs.salary column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT;')
    .then(()=>console.log('✓ Ensured jobs.type column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;')
    .then(()=>console.log('✓ Ensured jobs.description column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;')
    .then(()=>console.log('✓ Ensured jobs.requirements column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE;')
    .then(()=>console.log('✓ Ensured jobs.deadline column'))
    .catch(()=>{})
  dbClient.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted TIMESTAMP DEFAULT NOW();")
    .then(()=>console.log('✓ Ensured jobs.posted column'))
    .catch(()=>{})
  dbClient.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';")
    .then(()=>console.log('✓ Ensured jobs.status column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by INTEGER;')
    .then(()=>console.log('✓ Ensured jobs.created_by column'))
    .catch(()=>{})
  dbClient.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND table_schema='public' AND column_name='created_by') THEN
      BEGIN
        ALTER TABLE jobs ALTER COLUMN created_by DROP NOT NULL;
      EXCEPTION WHEN others THEN
        NULL;
      END;
    END IF; END $$;`)
    .then(()=>console.log('✓ Relaxed jobs.created_by NOT NULL if existed'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();')
    .then(()=>console.log('✓ Ensured jobs.updated_at column'))
    .catch(()=>{})
  dbClient.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_url TEXT;')
    .then(()=>console.log('✓ Ensured jobs.job_url column'))
    .catch(()=>{})
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS file_uploads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      file_type TEXT,
      file_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      verified_by INTEGER,
      verification_notes TEXT,
      uploaded_at TIMESTAMP DEFAULT NOW()
    )`)
    .then(()=>console.log('✓ Ensured file_uploads table'))
    .catch((e)=>console.error('file_uploads ensure error', e))

  dbClient.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      salary TEXT,
      type TEXT,
      description TEXT,
      requirements TEXT,
      deadline DATE,
      posted TIMESTAMP DEFAULT NOW(),
      status TEXT DEFAULT 'Active',
      created_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    .then(()=>console.log('✓ Ensured jobs table'))
    .catch((e)=>console.error('jobs ensure error', e))

  dbClient.query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'applied',
      cover_letter TEXT,
      applied_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, user_id)
    )`)
    .then(()=>console.log('✓ Ensured job_applications table'))
    .catch((e)=>console.error('applications ensure error', e))
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      is_read BOOLEAN DEFAULT FALSE
    )`)
    .then(()=>console.log('✓ Ensured notifications table'))
    .catch((e)=>console.error('notifications ensure error', e))
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS tpo_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      alternate_email TEXT,
      phone TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    .then(()=>console.log('✓ Ensured tpo_profiles table'))
    .catch((e)=>console.error('tpo_profiles ensure error', e))
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS tpo_reports (
      id SERIAL PRIMARY KEY,
      generated_by INTEGER REFERENCES users(id),
      type TEXT,
      data_json TEXT,
      generated_at TIMESTAMP DEFAULT NOW()
    )`)
    .then(()=>console.log('✓ Ensured tpo_reports table'))
    .catch((e)=>console.error('tpo_reports ensure error', e))
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      date DATE,
      event_time TEXT,
      form_url TEXT,
      status TEXT DEFAULT 'Upcoming',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`)
    .then(()=>console.log('✓ Ensured events table'))
    .catch((e)=>console.error('events ensure error', e))
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time TEXT;`)
    .then(()=>console.log('✓ Ensured events.event_time column'))
    .catch(()=>{})
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS form_url TEXT;`)
    .then(()=>console.log('✓ Ensured events.form_url column'))
    .catch(()=>{})
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS date DATE;`)
    .then(()=>console.log('✓ Ensured events.date column'))
    .catch(()=>{})
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE;`)
    .then(()=>console.log('✓ Ensured events.event_date column'))
    .catch(()=>{})
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming';`)
    .then(()=>console.log('✓ Ensured events.status column'))
    .catch(()=>{})
  dbClient.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT;`)
    .then(()=>console.log('✓ Ensured events.category column'))
    .catch(()=>{})
  dbClient.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='event_date') THEN
      EXECUTE 'ALTER TABLE events ALTER COLUMN event_date DROP NOT NULL';
    END IF; END $$;`)
    .then(()=>console.log('✓ Relaxed events.event_date NOT NULL if existed'))
    .catch(()=>{})
  dbClient.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='created_by') THEN
      EXECUTE 'ALTER TABLE events ALTER COLUMN created_by DROP NOT NULL';
    END IF; END $$;`)
    .then(()=>console.log('✓ Relaxed events.created_by NOT NULL if existed'))
    .catch(()=>{})
  dbClient.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='description') THEN
      BEGIN
        EXECUTE 'ALTER TABLE events ALTER COLUMN description DROP NOT NULL';
      EXCEPTION WHEN others THEN
        NULL;
      END;
    END IF; END $$;`)
    .then(()=>console.log('✓ Relaxed events.description NOT NULL if existed'))
    .catch(()=>{})
  dbClient.query(`DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='event_registrations' AND constraint_type='UNIQUE' AND constraint_name='event_registrations_unique'
      ) THEN
        BEGIN
          EXECUTE 'ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_unique UNIQUE (event_id, user_id)';
        EXCEPTION WHEN others THEN
          NULL;
        END;
      END IF;
    END $$;`)
    .then(()=>console.log('✓ Ensured unique constraint on event_registrations (event_id, user_id)'))
    .catch(()=>{})
  dbClient.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      registered_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    )`)
    .then(()=>console.log('✓ Ensured event_registrations table'))
    .catch((e)=>console.error('event_registrations ensure error', e))
}).catch(err => {
  console.error('❌ Database connection error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
// increase payload size for base64 uploads
app.use(express.json({ limit: '25mb' }));

// Utility helpers
const genLocalClerkId = () => `local_${Date.now()}_${Math.floor(Math.random()*1e6)}`;

const jobs = [];

const events = [
    {
        id: 1,
        title: "Resume Writing Workshop",
        date: "2024-01-10",
        time: "10:00 AM",
        location: "Seminar Hall A"
    },
    {
        id: 2,
        title: "Mock Interview Session",
        date: "2024-01-15",
        time: "2:00 PM",
        location: "Career Center"
    },
    {
        id: 3,
        title: "Industry Expert Talk",
        date: "2024-01-20",
        time: "4:00 PM",
        location: "Auditorium"
    }
];

// Files upload directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}
}

// Cloudflare R2 (S3-compatible)
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_SECRET_ACCESS_KEY || ''
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_BUCKET_NAME || ''
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '')
const s3 = (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT) ? new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
}) : null

// (Removed legacy CF_* client; using unified R2_* configuration above)

// Upload file (resume/certificate) via base64 JSON
app.post('/api/v1/files/upload', async (req, res) => {
  try {
    const { user_id, file_name, mime_type, file_type, content_base64 } = req.body || {};
    if (!user_id || !file_name || !mime_type || !file_type || !content_base64) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const userIdInt = parseInt(user_id)
    const userCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [userIdInt])
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const safeName = `${Date.now()}_${Math.floor(Math.random()*1e6)}_${String(file_name).replace(/[^a-zA-Z0-9.\-_]/g,'_')}`;
    const buf = Buffer.from(content_base64, 'base64');
    if (mime_type !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are accepted' })
    }
    if (buf.length > 500 * 1024) {
      return res.status(413).json({ error: 'Max file size is 500 KB' })
    }
    if (s3 && R2_BUCKET_NAME) {
      const objectKey = `${parseInt(user_id)}/${safeName}`
      await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: objectKey, Body: buf, ContentType: mime_type }))
      const publicUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${objectKey}`
      const insert = await dbClient.query(
        `INSERT INTO file_uploads (user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at`,
        [parseInt(user_id), file_name, objectKey, buf.length, mime_type, file_type, publicUrl]
      );
      return res.status(201).json(insert.rows[0]);
    } else {
      const destPath = path.join(UPLOAD_DIR, safeName);
      fs.writeFileSync(destPath, buf);
      const stat = fs.statSync(destPath);
      const insert = await dbClient.query(
        `INSERT INTO file_uploads (user_id, file_name, file_path, file_size, mime_type, file_type, uploaded_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id, user_id, file_name, file_path, file_size, mime_type, file_type, uploaded_at`,
        [parseInt(user_id), file_name, destPath, stat.size, mime_type, file_type]
      );
      return res.status(201).json(insert.rows[0]);
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload to Cloudflare R2 explicitly (uses R2_* envs)
app.post('/api/v1/files/upload-r2', async (req, res) => {
  try {
    const { user_id, file_name, mime_type, file_type, content_base64 } = req.body || {};
    if (!user_id || !file_name || !mime_type || !file_type || !content_base64) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const userIdIntR2 = parseInt(user_id)
    const r2UserCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [userIdIntR2])
    if (r2UserCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '')
    const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_BUCKET_NAME
    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      return res.status(500).json({ error: 'Cloud storage is not configured' })
    }
    const client = new S3Client({ region: 'auto', endpoint, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } })
    const safeName = `${Date.now()}_${Math.floor(Math.random()*1e6)}_${String(file_name).replace(/[^a-zA-Z0-9.\-_]/g,'_')}`
    const objectKey = `${parseInt(user_id)}/${safeName}`
    const buf = Buffer.from(content_base64, 'base64')
    if (mime_type !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are accepted' })
    }
    if (buf.length > 500 * 1024) {
      return res.status(413).json({ error: 'Max file size is 500 KB' })
    }
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: buf, ContentType: mime_type }))
    const publicUrl = `${endpoint}/${bucket}/${objectKey}`
    const insert = await dbClient.query(
      `INSERT INTO file_uploads (user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at`,
      [parseInt(user_id), file_name, objectKey, buf.length, mime_type, file_type, publicUrl]
    )
    return res.status(201).json(insert.rows[0])
  } catch (error) {
    console.error('R2 upload error:', error)
    res.status(500).json({ error: 'Failed to upload file to Cloudflare R2' })
  }
})

// Upload via multipart/form-data (preferred for larger files)
app.post('/api/v1/files/upload-r2-multipart', upload.single('file'), async (req, res) => {
  try {
    const { user_id, file_type } = req.body || {}
    const file = req.file
    if (!user_id || !file || !file.originalname || !file.mimetype) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const userIdInt = parseInt(user_id)
    const userCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [userIdInt])
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '')
    const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_BUCKET_NAME
    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      return res.status(500).json({ error: 'Cloud storage is not configured' })
    }
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are accepted' })
    }
    if (file.buffer.length > 500 * 1024) {
      return res.status(413).json({ error: 'Max file size is 500 KB' })
    }
    const client = new S3Client({ region: 'auto', endpoint, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } })
    const safeName = `${Date.now()}_${Math.floor(Math.random()*1e6)}_${String(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g,'_')}`
    const objectKey = `${userIdInt}/${safeName}`
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: file.buffer, ContentType: file.mimetype }))
    const publicUrl = `${endpoint}/${bucket}/${objectKey}`
    const insert = await dbClient.query(
      `INSERT INTO file_uploads (user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at`,
      [userIdInt, file.originalname, objectKey, file.buffer.length, file.mimetype, file_type || 'resume', publicUrl]
    )
    return res.status(201).json(insert.rows[0])
  } catch (error) {
    console.error('R2 multipart upload error:', error)
    res.status(500).json({ error: 'Failed to upload file to Cloudflare R2 (multipart)' })
  }
})

// Local-only upload fallback (always stores on disk)
app.post('/api/v1/files/upload-local', async (req, res) => {
  try {
    const { user_id, file_name, mime_type, file_type, content_base64 } = req.body || {};
    if (!user_id || !file_name || !mime_type || !file_type || !content_base64) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const userIdIntLocal = parseInt(user_id)
    const localUserCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [userIdIntLocal])
    if (localUserCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const safeName = `${Date.now()}_${Math.floor(Math.random()*1e6)}_${String(file_name).replace(/[^a-zA-Z0-9.\-_]/g,'_')}`;
    const destPath = path.join(UPLOAD_DIR, safeName);
    const buf = Buffer.from(content_base64, 'base64');
    fs.writeFileSync(destPath, buf);
    const stat = fs.statSync(destPath);
    const insert = await dbClient.query(
      `INSERT INTO file_uploads (user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at`,
      [parseInt(user_id), file_name, destPath, stat.size, mime_type, file_type, destPath]
    );
    return res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error('Local upload error:', error);
    res.status(500).json({ error: 'Failed to upload file locally' });
  }
});

// List uploaded files for a user
app.get('/api/v1/files/by-user/:user_id', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    const result = await dbClient.query(
      `SELECT id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at FROM file_uploads WHERE user_id = $1 ORDER BY uploaded_at DESC`,
      [userId]
    );
    const rows = result.rows
    const filtered = []
    for (const r of rows) {
      if (await ensureExists(r.file_path)) filtered.push(r)
    }
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Download/view file by id
app.get('/api/v1/files/:file_id/download', async (req, res) => {
  try {
    const fileId = parseInt(req.params.file_id);
    const result = await dbClient.query(`SELECT file_path, mime_type, file_name FROM file_uploads WHERE id = $1`, [fileId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    const { file_path, mime_type, file_name } = result.rows[0];
    const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_BUCKET_NAME
    if (s3 && bucket) {
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: file_path }), { expiresIn: 600 })
      return res.redirect(url)
    }
    const absPath = path.resolve(file_path);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'Stored file not found on server' });
    res.setHeader('Content-Type', mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);
    res.sendFile(absPath);
  } catch (error) {
    console.error('View file error:', error);
    res.status(500).json({ error: 'Failed to download/view file' });
  }
});

// Get a presigned URL for viewing/downloading a file
app.get('/api/v1/files/:file_id/presigned', async (req, res) => {
  try {
    const fileId = parseInt(req.params.file_id)
    const row = await dbClient.query(`SELECT file_path FROM file_uploads WHERE id = $1`, [fileId])
    if (row.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '')
    const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_BUCKET_NAME
    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      return res.status(500).json({ error: 'Cloud storage is not configured' })
    }
    const client = new S3Client({ region: 'auto', endpoint, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } })
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: row.rows[0].file_path }), { expiresIn: 600 })
    res.json({ url })
  } catch (error) {
    console.error('Presigned error:', error)
    res.status(500).json({ error: 'Failed to generate presigned URL' })
  }
})

// File metadata
app.get('/api/v1/files/:file_id', async (req, res) => {
  try {
    const fileId = parseInt(req.params.file_id)
    const result = await dbClient.query(`SELECT id, user_id, file_name, file_path, file_size, mime_type, file_type, file_url, uploaded_at, COALESCE(is_verified,false) as is_verified FROM file_uploads WHERE id = $1`, [fileId])
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    const r = result.rows[0]
    const exists = fs.existsSync(path.resolve(r.file_path))
    res.json({ ...r, exists })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load file metadata' })
  }
})

// Clerk webhook to sync users into Postgres
app.post('/api/v1/clerk/webhook', async (req, res) => {
    try {
        const { type, data } = req.body || {}
        if (!type || !data) return res.status(400).json({ error: 'Invalid webhook payload' })
        if (type === 'user.created' || type === 'user.updated') {
            const clerk_user_id = data.id
            const email_addresses = data.email_addresses || []
            const primaryId = data.primary_email_address_id
            const primary = email_addresses.find(e => e.id === primaryId) || email_addresses[0] || {}
            const email = primary.email_address || ''
            const first_name = data.first_name || ''
            const last_name = data.last_name || ''
            const role = ((data.unsafe_metadata && data.unsafe_metadata.role) || 'STUDENT').toUpperCase()

            const existing = await dbClient.query('SELECT id FROM users WHERE clerk_user_id = $1', [clerk_user_id])
            if (existing.rows.length > 0) {
                await dbClient.query(
                    `UPDATE users SET email = $1, first_name = $2, last_name = $3, role = $4, updated_at = NOW() WHERE clerk_user_id = $5`,
                    [email, first_name, last_name, role, clerk_user_id]
                )
            } else {
                await dbClient.query(
                    `INSERT INTO users (clerk_user_id, email, first_name, last_name, role, is_active, is_approved, profile_complete, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, true, $6, false, NOW(), NOW())`,
                    [clerk_user_id, email, first_name, last_name, role, role === 'STUDENT']
                )
            }
            return res.json({ success: true })
        }
        return res.json({ message: 'Event ignored' })
    } catch (error) {
        console.error('Webhook error:', error)
        res.status(500).json({ error: 'Webhook processing failed' })
    }
})

// API Routes
app.post('/api/v1/users/register', async (req, res) => {
    const { email, firstName, lastName, role, phoneNumber, clerkUserId } = req.body;
    
    // Validate required fields
    if (!email || !firstName || !role || !clerkUserId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const candidateClerkId = clerkUserId && clerkUserId.trim() ? clerkUserId.trim() : genLocalClerkId();
        const checkResult = await dbClient.query(
            'SELECT id FROM users WHERE email = $1 OR clerk_user_id = $2',
            [email, candidateClerkId]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'User already registered' });
        }
        
        // Insert user into database
        const insertResult = await dbClient.query(
            `INSERT INTO users (clerk_user_id, email, first_name, last_name, phone_number, role, is_active, is_approved, profile_complete, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING id, clerk_user_id, email, first_name, last_name, role, phone_number`,
            [candidateClerkId, email, firstName, lastName || '', phoneNumber || '', (role || 'student').toLowerCase(), true, (role || '').toUpperCase() === 'STUDENT', false]
        );
        
        const newUser = insertResult.rows[0];
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
});

app.get('/api/v1/users/clerk/:clerk_user_id', async (req, res) => {
    try {
        const result = await dbClient.query(
            'SELECT id, clerk_user_id, email, first_name, last_name, role, phone_number FROM users WHERE clerk_user_id = $1',
            [req.params.clerk_user_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/api/v1/users/by-email/:email', async (req, res) => {
    try {
        const result = await dbClient.query(
            'SELECT id, clerk_user_id, email, first_name, last_name, role, phone_number FROM users WHERE email = $1',
            [req.params.email]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/api/v1/users/:user_id', async (req, res) => {
    try {
        const result = await dbClient.query(
            'SELECT id, clerk_user_id, email, first_name, last_name, role, phone_number FROM users WHERE id = $1',
            [parseInt(req.params.user_id)]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/api/v1/users/:user_id/profile', async (req, res) => {
    try {
        const result = await dbClient.query(
            'SELECT id, user_id, phone, degree, year, skills, about, alternate_email, is_approved FROM profiles WHERE user_id = $1',
            [parseInt(req.params.user_id)]
        );
        if (result.rows.length === 0) {
            return res.json({
                id: null,
                user_id: parseInt(req.params.user_id),
                phone: null,
                degree: null,
                year: null,
                skills: null,
                about: null,
                alternate_email: null,
                is_approved: false
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/api/v1/users/:user_id/profile', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { phone, degree, year, skills, about, alternate_email } = req.body;
  try {
    const userCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    await dbClient.query(
      `INSERT INTO profiles (user_id, phone, degree, year, skills, about, alternate_email, is_approved, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET phone = EXCLUDED.phone, degree = EXCLUDED.degree, year = EXCLUDED.year, skills = EXCLUDED.skills, about = EXCLUDED.about, alternate_email = EXCLUDED.alternate_email, updated_at = NOW()`,
      [userId, phone || null, degree || null, year || null, skills || null, about || null, alternate_email || null]
    );
    const result = await dbClient.query('SELECT id, user_id, phone, degree, year, skills, about, alternate_email, is_approved FROM profiles WHERE user_id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert profile' });
  }
});

// Update basic user info (name only; email cannot be changed here)
app.put('/api/v1/users/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { first_name, last_name } = req.body;
  try {
    const result = await dbClient.query('UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = NOW() WHERE id = $3 RETURNING id, clerk_user_id, email, first_name, last_name, role, phone_number', [first_name || null, last_name || null, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/v1/jobs', async (req, res) => {
    try {
        const result = await dbClient.query(`SELECT id, title, company, location, salary, type, posted, deadline, status, job_url FROM jobs WHERE COALESCE(status,'Active') <> 'Closed' ORDER BY posted DESC`)
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Failed to load jobs', details: String(error && error.message || '') })
    }
});

app.get('/api/v1/events', async (req, res) => {
  try {
    const status = (req.query.status || '').toString()
    const postedBy = (req.query.posted_by || '').toString()
    let sql = `SELECT id, title, location, description, COALESCE(date, event_date) AS date, event_time AS time, status, form_url, category FROM events`
    const params = []
    const conds = []
    if (status) {
      conds.push(`LOWER(COALESCE(status,'Upcoming')) = LOWER($${params.length+1})`)
      params.push(status)
    } else {
      conds.push(`COALESCE(status,'Upcoming') <> 'Cancelled'`)
    }
    if (postedBy) {
      if (postedBy.toLowerCase() === 'tpo') {
        conds.push(`EXISTS (SELECT 1 FROM users u WHERE u.id = events.created_by AND LOWER(u.role) = 'tpo')`)
      } else {
        conds.push(`EXISTS (SELECT 1 FROM users u WHERE u.id = events.created_by AND LOWER(u.role) = LOWER($${params.length+1}))`)
        params.push(postedBy)
      }
    }
    if (conds.length) sql += ` WHERE ` + conds.join(' AND ')
    sql += ` ORDER BY COALESCE(date, NOW()) ASC`
    const result = await dbClient.query(sql, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Load events error:', error?.message)
    res.status(500).json({ error: 'Failed to load events', details: String(error?.message || '') })
  }
})

// TPO: create event
app.post('/api/v1/tpo/events', async (req, res) => {
  try {
    const { title, description, location, date, time, status, form_url, category } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Missing title' })
    const result = await dbClient.query(
      `INSERT INTO events (title, description, location, date, event_date, event_time, status, form_url, category, created_at, updated_at)
       VALUES (
         $1,
         COALESCE(NULLIF($2,''),'Event'),
         COALESCE(NULLIF($3,''),'') ,
         COALESCE($4::date, NOW()::date),
         COALESCE($4::date, NOW()::date),
         COALESCE(NULLIF($5,''),'') ,
         COALESCE($6,'Upcoming'),
         COALESCE(NULLIF($7,''),'') ,
         COALESCE(NULLIF($8,''),'') ,
         NOW(),NOW()
       )
       RETURNING id, title, description, location, COALESCE(date,event_date) AS date, event_time AS time, status, form_url, category`,
      [title, description, location, date, time, status, form_url, category]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create event error:', error?.message)
    res.status(500).json({ error: 'Failed to create event', details: String(error?.message || '') })
  }
})

// TPO: update event
app.put('/api/v1/tpo/events/:event_id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.event_id)
    const { title, description, location, date, time, status, form_url, category } = req.body || {}
    const result = await dbClient.query(
      `UPDATE events SET
         title = COALESCE($1,title),
         description = COALESCE($2,description),
         location = COALESCE($3,location),
         date = COALESCE($4::date,date),
         event_date = COALESCE($4::date,event_date),
         event_time = COALESCE($5,event_time),
         status = COALESCE($6,status),
         form_url = COALESCE($7,form_url),
         category = COALESCE($8,category),
         updated_at = NOW()
       WHERE id = $9
       RETURNING id, title, description, location, COALESCE(date,event_date) AS date, event_time AS time, status, form_url, category`,
      [title || null, description || null, location || null, date || null, time || null, status || null, form_url || null, category || null, eventId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Student: register to event
app.post('/api/v1/events/:event_id/register', async (req, res) => {
  try {
    const eventId = parseInt(req.params.event_id)
    const { user_id, email, clerkUserId } = req.body || {}
    let userId = Number.isFinite(parseInt(user_id)) ? parseInt(user_id) : NaN
    const ev = await dbClient.query('SELECT id, status FROM events WHERE id = $1', [eventId])
    if (ev.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    if ((ev.rows[0].status || 'Upcoming') === 'Cancelled') return res.status(400).json({ error: 'Event is cancelled' })
    if (Number.isNaN(userId)) {
      let emailVal = (typeof email === 'string' ? email : null)
      if (!emailVal && typeof clerkUserId === 'string' && clerkUserId) {
        const byClerk = await dbClient.query('SELECT id, email FROM users WHERE clerk_user_id = $1', [clerkUserId])
        if (byClerk.rows.length) emailVal = byClerk.rows[0].email
      }
      if (emailVal) {
        const byEmail = await dbClient.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [emailVal])
        if (byEmail.rows.length) userId = byEmail.rows[0].id
        if (Number.isNaN(userId)) {
          const byAlt = await dbClient.query('SELECT user_id FROM profiles WHERE LOWER(alternate_email) = LOWER($1)', [emailVal])
          if (byAlt.rows.length) userId = byAlt.rows[0].user_id
        }
      }
    }
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Missing user_id or email' })
    const u = await dbClient.query('SELECT id FROM users WHERE id = $1', [userId])
    if (u.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const upd = await dbClient.query('UPDATE event_registrations SET registered_at = NOW() WHERE event_id = $1 AND user_id = $2', [eventId, userId])
    if (upd.rowCount === 0) {
      await dbClient.query('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES ($1,$2,NOW())', [eventId, userId])
    }
    res.status(201).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to register for event', details: String(error && error.message || '') })
  }
})

// TPO: event registrations list
app.get('/api/v1/tpo/events/:event_id/registrations', async (req, res) => {
  try {
    const eventId = parseInt(req.params.event_id)
    const result = await dbClient.query(
      `SELECT r.id, r.user_id, r.registered_at, u.first_name, u.last_name, u.email
       FROM event_registrations r JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 ORDER BY r.registered_at DESC`,
      [eventId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load registrations' })
  }
})

// TPO: event details with counts
app.get('/api/v1/tpo/events/:event_id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.event_id)
    const ev = await dbClient.query('SELECT id, title, description, location, COALESCE(date,event_date) AS date, event_time AS time, status, form_url, category FROM events WHERE id = $1', [eventId])
    if (ev.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    const count = await dbClient.query('SELECT COUNT(*)::int AS registered FROM event_registrations WHERE event_id = $1', [eventId])
    res.json({ ...ev.rows[0], registered: count.rows[0].registered })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load event details' })
  }
})

// TPO: send reminders to registered students
app.post('/api/v1/tpo/events/:event_id/reminders', async (req, res) => {
  try {
    const eventId = parseInt(req.params.event_id)
    const ev = await dbClient.query('SELECT id, title, COALESCE(date,event_date) AS date, event_time AS time, location FROM events WHERE id = $1', [eventId])
    if (ev.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
    const rows = await dbClient.query('SELECT user_id FROM event_registrations WHERE event_id = $1', [eventId])
    const msg = `Reminder: ${ev.rows[0].title} at ${ev.rows[0].location} on ${ev.rows[0].date || ''} ${ev.rows[0].time || ''}`
    await dbClient.query(
      `INSERT INTO notifications (user_id, title, message, created_at, is_read)
       SELECT user_id, $1, $2, NOW(), FALSE FROM event_registrations WHERE event_id = $3`,
      ['Event Reminder', msg, eventId]
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders' })
  }
})

// TPO: pending profiles
app.get('/api/v1/tpo/pending-profiles', async (req, res) => {
  try {
    const result = await dbClient.query(
      `SELECT u.id as user_id, u.first_name, u.last_name, u.email, p.phone, p.degree, p.year
       FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE COALESCE(p.is_approved, false) = false
       ORDER BY p.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pending profiles' })
  }
})

// TPO: approve profile
app.put('/api/v1/tpo/profiles/:user_id/approve', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const { notes } = req.body || {}
    const result = await dbClient.query(
      `UPDATE profiles SET is_approved = true, approval_notes = COALESCE($1, approval_notes), updated_at = NOW() WHERE user_id = $2 RETURNING id, user_id, is_approved`,
      [notes || null, userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve profile' })
  }
})

// TPO: pending resumes
app.get('/api/v1/tpo/pending-resumes', async (req, res) => {
  try {
    const result = await dbClient.query(
      `SELECT f.id, f.user_id, f.file_name, f.file_type, f.mime_type, f.uploaded_at, COALESCE(f.is_verified,false) as is_verified,
              u.first_name, u.last_name, u.email
       FROM file_uploads f JOIN users u ON u.id = f.user_id
       WHERE f.file_type = 'resume' AND COALESCE(f.is_verified, false) = false
       ORDER BY f.uploaded_at DESC`
    )
    const rows = result.rows
    const filtered = []
    for (const r of rows) { if (await ensureExists(r.file_name ? r.file_path : r.file_path)) filtered.push(r) }
    res.json(filtered)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pending resumes' })
  }
})

// TPO: verified resumes
app.get('/api/v1/tpo/verified-resumes', async (req, res) => {
  try {
    const result = await dbClient.query(
      `SELECT f.id, f.user_id, f.file_name, f.file_type, f.mime_type, f.uploaded_at, COALESCE(f.is_verified,false) as is_verified,
              u.first_name, u.last_name, u.email
       FROM file_uploads f JOIN users u ON u.id = f.user_id
       WHERE f.file_type = 'resume' AND COALESCE(f.is_verified, false) = true
       ORDER BY f.uploaded_at DESC`
    )
    const rows = result.rows
    const filtered = []
    for (const r of rows) { if (await ensureExists(r.file_path)) filtered.push(r) }
    res.json(filtered)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load verified resumes' })
  }
})

// TPO: approved students list with placement status and latest resume
app.get('/api/v1/tpo/approved-students', async (req, res) => {
  try {
    const result = await dbClient.query(
      `SELECT u.id as user_id, u.first_name, u.last_name, u.email, p.degree, p.year, COALESCE(p.placement_status, 'Not placed') as placement_status,
              (SELECT f.id FROM file_uploads f WHERE f.user_id = u.id AND f.file_type = 'resume' ORDER BY f.uploaded_at DESC LIMIT 1) as resume_id,
              (SELECT f.file_name FROM file_uploads f WHERE f.user_id = u.id AND f.file_type = 'resume' ORDER BY f.uploaded_at DESC LIMIT 1) as resume_name,
              (SELECT COALESCE(f.is_verified,false) FROM file_uploads f WHERE f.user_id = u.id AND f.file_type = 'resume' ORDER BY f.uploaded_at DESC LIMIT 1) as resume_verified
       FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE COALESCE(p.is_approved, false) = true
       ORDER BY u.first_name, u.last_name`
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load approved students' })
  }
})

// TPO: update placement status
app.put('/api/v1/tpo/placement/:user_id', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const { placement_status } = req.body || {}
    const result = await dbClient.query(`UPDATE profiles SET placement_status = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, placement_status`, [placement_status || null, userId])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update placement status' })
  }
})

// TPO profile (alternate_email, phone)
app.get('/api/v1/tpo/:user_id/profile', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const result = await dbClient.query('SELECT user_id, alternate_email, phone, updated_at FROM tpo_profiles WHERE user_id = $1', [userId])
    if (result.rows.length === 0) return res.json({ user_id: userId, alternate_email: null, phone: null })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to load TPO profile' })
  }
})

app.post('/api/v1/tpo/:user_id/profile', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const { alternate_email, phone } = req.body || {}
    const user = await dbClient.query('SELECT id FROM users WHERE id = $1', [userId])
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    await dbClient.query(`INSERT INTO tpo_profiles (user_id, alternate_email, phone, updated_at)
      VALUES ($1,$2,$3,NOW())
      ON CONFLICT (user_id) DO UPDATE SET alternate_email = EXCLUDED.alternate_email, phone = EXCLUDED.phone, updated_at = NOW()`, [userId, alternate_email || null, phone || null])
    const result = await dbClient.query('SELECT user_id, alternate_email, phone, updated_at FROM tpo_profiles WHERE user_id = $1', [userId])
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to save TPO profile' })
  }
})

// TPO stats summary JSON
app.get('/api/v1/tpo/stats/summary', async (req, res) => {
  try {
    const totalJobs = await dbClient.query('SELECT COUNT(*)::int AS count FROM jobs')
    const totalApps = await dbClient.query('SELECT COUNT(*)::int AS count FROM job_applications')
    const totalSelected = await dbClient.query("SELECT COUNT(*)::int AS count FROM job_applications WHERE LOWER(status) = 'selected'")
    const perJob = await dbClient.query(`
      SELECT j.id, j.title, COALESCE(COUNT(a.id),0)::int AS applications,
             COALESCE(SUM(CASE WHEN LOWER(a.status)='selected' THEN 1 ELSE 0 END),0)::int AS selected
      FROM jobs j LEFT JOIN job_applications a ON a.job_id = j.id
      GROUP BY j.id, j.title
      ORDER BY applications DESC
    `)
    res.json({ total_jobs: totalJobs.rows[0].count, total_applications: totalApps.rows[0].count, total_selected: totalSelected.rows[0].count, applications_by_job: perJob.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate stats' })
  }
})

// TPO stats CSV and store in reports
app.get('/api/v1/tpo/stats/summary.csv', async (req, res) => {
  try {
    const perJob = await dbClient.query(`
      SELECT j.id, j.title, COALESCE(COUNT(a.id),0)::int AS applications,
             COALESCE(SUM(CASE WHEN LOWER(a.status)='selected' THEN 1 ELSE 0 END),0)::int AS selected
      FROM jobs j LEFT JOIN job_applications a ON a.job_id = j.id
      GROUP BY j.id, j.title
      ORDER BY applications DESC
    `)
    const rows = perJob.rows
    const header = 'job_id,title,applications,selected\n'
    const body = rows.map(r=>`${r.id},"${String(r.title).replace(/"/g,'"')}",${r.applications},${r.selected}`).join('\n')
    const csv = header + body
    await dbClient.query('INSERT INTO tpo_reports (generated_by, type, data_json, generated_at) VALUES ($1,$2,$3,NOW())', [null, 'summary', JSON.stringify(rows)])
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="tpo_summary.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSV' })
  }
})

// TPO stats PDF
app.get('/api/v1/tpo/stats/summary.pdf', async (req, res) => {
  try {
    const totalsJobs = await dbClient.query('SELECT COUNT(*)::int AS count FROM jobs')
    const totalsApps = await dbClient.query('SELECT COUNT(*)::int AS count FROM job_applications')
    const totalsSelected = await dbClient.query("SELECT COUNT(*)::int AS count FROM job_applications WHERE LOWER(status) = 'selected'")
    const perJob = await dbClient.query(`
      SELECT j.id, j.title, COALESCE(COUNT(a.id),0)::int AS applications,
             COALESCE(SUM(CASE WHEN LOWER(a.status)='selected' THEN 1 ELSE 0 END),0)::int AS selected
      FROM jobs j LEFT JOIN job_applications a ON a.job_id = j.id
      GROUP BY j.id, j.title
      ORDER BY applications DESC
    `)

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="tpo_summary.pdf"')
    doc.pipe(res)

    doc.fontSize(20).text('TPO Statistical Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`)
    doc.moveDown()
    doc.text(`Total Jobs: ${totalsJobs.rows[0].count}`)
    doc.text(`Total Applications: ${totalsApps.rows[0].count}`)
    doc.text(`Total Selected: ${totalsSelected.rows[0].count}`)
    doc.moveDown()
    doc.fontSize(14).text('Applications by Job')
    doc.moveDown(0.5)
    perJob.rows.forEach((r) => {
      doc.fontSize(12).text(`• [${r.id}] ${r.title} — Applications: ${r.applications}, Selected: ${r.selected}`)
    })

    await dbClient.query('INSERT INTO tpo_reports (generated_by, type, data_json, generated_at) VALUES ($1,$2,$3,NOW())', [null, 'summary_pdf', JSON.stringify(perJob.rows)])
    doc.end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

// Notifications APIs
app.get('/api/v1/users/:user_id/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const result = await dbClient.query('SELECT id, title, message, created_at, is_read FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load notifications' })
  }
})

app.post('/api/v1/users/:user_id/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const { title, message } = req.body || {}
    await dbClient.query('INSERT INTO notifications (user_id, title, message, created_at, is_read) VALUES ($1,$2,$3,NOW(),FALSE)', [userId, title || null, message || null])
    res.status(201).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' })
  }
})

app.put('/api/v1/notifications/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await dbClient.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark read' })
  }
})

// TPO: broadcast notification to all students (or filtered groups in future)
app.post('/api/v1/tpo/notifications/broadcast', async (req, res) => {
  try {
    const { title, message } = req.body || {}
    if (!title || !message) return res.status(400).json({ error: 'Title and message are required' })
    const insert = await dbClient.query(
      `INSERT INTO notifications (user_id, title, message, created_at, is_read)
       SELECT id, $1, $2, NOW(), FALSE FROM users WHERE LOWER(role) = 'student'`
      , [title, message]
    )
    res.status(201).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast notification' })
  }
})

// Rejection endpoints
app.put('/api/v1/tpo/profiles/:user_id/reject', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const { reason } = req.body || {}
    const result = await dbClient.query(
      `UPDATE profiles SET is_approved = FALSE, approval_notes = COALESCE($1, approval_notes), updated_at = NOW() WHERE user_id = $2 RETURNING id, user_id, is_approved`,
      [reason || null, userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    await dbClient.query('INSERT INTO notifications (user_id, title, message, created_at, is_read) VALUES ($1,$2,$3,NOW(),FALSE)', [userId, 'Profile Rejected', reason || 'Your profile was rejected'])
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject profile' })
  }
})

app.put('/api/v1/files/:file_id/reject', async (req, res) => {
  try {
    const fileId = parseInt(req.params.file_id)
    const { reason } = req.body || {}
    const row = await dbClient.query('SELECT user_id FROM file_uploads WHERE id = $1', [fileId])
    if (row.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    const userId = row.rows[0].user_id
    const result = await dbClient.query(
      `UPDATE file_uploads SET is_verified = FALSE, verification_notes = COALESCE($1, verification_notes) WHERE id = $2 RETURNING id, user_id, is_verified`,
      [reason || null, fileId]
    )
    await dbClient.query('INSERT INTO notifications (user_id, title, message, created_at, is_read) VALUES ($1,$2,$3,NOW(),FALSE)', [userId, 'Resume Rejected', reason || 'Your resume was rejected'])
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject file' })
  }
})

// Admin: pending certificates
app.get('/api/v1/admin/pending-certificates', async (req, res) => {
  try {
    const result = await dbClient.query(
      `SELECT f.id, f.user_id, f.file_name, f.file_type, f.mime_type, f.uploaded_at, COALESCE(f.is_verified,false) as is_verified,
              u.first_name, u.last_name, u.email
       FROM file_uploads f JOIN users u ON u.id = f.user_id
       WHERE f.file_type = 'certificate' AND COALESCE(f.is_verified, false) = false
       ORDER BY f.uploaded_at DESC`
    )
    const rows = result.rows
    const filtered = []
    for (const r of rows) { if (await ensureExists(r.file_path)) filtered.push(r) }
    res.json(filtered)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pending certificates' })
  }
})

// Users helper APIs
app.get('/api/v1/users/by-email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || '')
    const result = await dbClient.query('SELECT id, clerk_user_id, email, first_name, last_name, role, phone_number FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user by email' })
  }
})

app.post('/api/v1/users/register', async (req, res) => {
  try {
    const { email, firstName, lastName, role, phoneNumber, clerkUserId } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const exists = await dbClient.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) {
      const row = await dbClient.query('SELECT id, clerk_user_id, email, first_name, last_name, role, phone_number FROM users WHERE email = $1', [email])
      return res.json(row.rows[0])
    }
    const result = await dbClient.query(
      `INSERT INTO users (email, first_name, last_name, role, phone_number, clerk_user_id, is_active, is_approved, profile_complete, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,false,false,NOW(),NOW())
       RETURNING id, clerk_user_id, email, first_name, last_name, role, phone_number`,
      [email, firstName || null, lastName || null, (role || 'student').toLowerCase(), phoneNumber || null, clerkUserId || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' })
  }
})

// TPO job APIs
app.get('/api/v1/tpo/jobs', async (req, res) => {
  try {
    const result = await dbClient.query(`
      SELECT j.id, j.title, j.company, j.location, j.posted, j.status, j.job_url,
             COALESCE((SELECT COUNT(a.id) FROM job_applications a WHERE a.job_id = j.id),0)::int AS applicants
      FROM jobs j
      ORDER BY j.posted DESC`)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load TPO jobs' })
  }
})

app.post('/api/v1/tpo/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, type, description, requirements, deadline, created_by, job_url } = req.body || {}
    if (!title || !company) return res.status(400).json({ error: 'Missing title/company' })
    const result = await dbClient.query(
      `INSERT INTO jobs (title, company, location, salary, type, description, requirements, deadline, status, created_by, posted, updated_at, job_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Active',$9,NOW(),NOW(),$10)
       RETURNING id, title, company, location, salary, type, posted, deadline, status, job_url`,
      [title, company, location || '', salary || '', type || 'Full-time', description || '', requirements || '', deadline || null, created_by || null, job_url || null]
    )
    const msg = `Company: ${company}. Location: ${location || '—'}. Type: ${type || 'Full-time'}`
    await dbClient.query(
      `INSERT INTO notifications (user_id, title, message, created_at, is_read)
       SELECT id, $1, $2, NOW(), FALSE FROM users WHERE LOWER(role) = 'student'`,
      [`New Job: ${title}`, msg]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job', details: String(error && error.message || '') })
  }
})

app.put('/api/v1/tpo/jobs/:job_id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.job_id)
    const { title, company, location, salary, type, description, requirements, deadline, status, job_url } = req.body || {}
    const result = await dbClient.query(
      `UPDATE jobs SET 
        title = COALESCE($1,title), company = COALESCE($2,company), location = COALESCE($3,location),
        salary = COALESCE($4,salary), type = COALESCE($5,type), description = COALESCE($6,description),
        requirements = COALESCE($7,requirements), deadline = COALESCE($8,deadline), status = COALESCE($9,status),
        job_url = COALESCE($10,job_url), updated_at = NOW()
       WHERE id = $11
       RETURNING id, title, company, location, salary, type, posted, deadline, status, job_url`,
      [title || null, company || null, location || null, salary || null, type || null, description || null, requirements || null, deadline || null, status || null, job_url || null, jobId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' })
  }
})

// Student apply to job
app.post('/api/v1/jobs/:job_id/apply', async (req, res) => {
  try {
    const jobId = parseInt(req.params.job_id)
    const { user_id, cover_letter } = req.body || {}
    const userIdInt = parseInt(user_id)
    const job = await dbClient.query('SELECT id FROM jobs WHERE id = $1', [jobId])
    if (job.rows.length === 0) return res.status(404).json({ error: 'Job not found' })
    const user = await dbClient.query('SELECT id FROM users WHERE id = $1', [userIdInt])
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    await dbClient.query(
      `INSERT INTO job_applications (job_id, user_id, cover_letter)
       VALUES ($1,$2,$3)
       ON CONFLICT (job_id, user_id) DO UPDATE SET cover_letter = EXCLUDED.cover_letter, applied_at = NOW()`,
      [jobId, userIdInt, cover_letter || null]
    )
    res.status(201).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply' })
  }
})

// TPO view applications for a job
app.get('/api/v1/tpo/jobs/:job_id/applications', async (req, res) => {
  try {
    const jobId = parseInt(req.params.job_id)
    const result = await dbClient.query(
      `SELECT a.id, a.user_id, a.status, a.applied_at, u.first_name, u.last_name, u.email
       FROM job_applications a JOIN users u ON u.id = a.user_id
       WHERE a.job_id = $1 ORDER BY a.applied_at DESC`,
      [jobId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load applications' })
  }
})
// TPO: verify resume
app.put('/api/v1/files/:file_id/verify', async (req, res) => {
  try {
    const fileId = parseInt(req.params.file_id)
    const { is_verified, verified_by, verification_notes } = req.body || {}
    const result = await dbClient.query(
      `UPDATE file_uploads SET is_verified = COALESCE($1, is_verified), verified_by = COALESCE($2, verified_by), verification_notes = COALESCE($3, verification_notes) WHERE id = $4
       RETURNING id, user_id, file_name, file_type, mime_type, uploaded_at, is_verified, verified_by, verification_notes`,
      [is_verified === true, verified_by || null, verification_notes || null, fileId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify file' })
  }
})

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Health check
app.listen(PORT, () => {
    console.log(`PrepSphere API server running on port ${PORT}`);
    console.log(`Access the API at: http://localhost:${PORT}`);
    console.log(`Frontend is at: http://localhost:3000`);
});
const ensureExists = async (filePath) => {
  try {
    if (s3 && R2_BUCKET_NAME) {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: filePath }))
      return true
    }
    const abs = path.resolve(filePath)
    return fs.existsSync(abs)
  } catch {
    return false
  }
}
  // moved to startup ensures block
