/**
 * Upload Route
 * Serves the upload page and handles photo uploads.
 */
const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

// Ensure the images directory exists (skip on read-only filesystems like Vercel)
try {
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
} catch (e) {
    console.warn('⚠️ Could not create images directory (read-only filesystem)');
}

// ─── Multer Setup ───
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename: (req, file, cb) => {
        // Enforce strict filenames based on the request body 'filename' field
        const targetFilename = req.body.filename === 'about.jpg' ? 'about.jpg' : 'hero.jpg';
        cb(null, targetFilename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'));
        }
    }
});

// ─── Upload Page ───
router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Portfolio Photos</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0a0a0f; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 60px 20px; }
        h1 { font-size: 1.8rem; margin-bottom: 8px; }
        h1 span { color: #06b6d4; }
        .subtitle { color: #94a3b8; margin-bottom: 40px; font-size: 0.95rem; }
        .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 600px; width: 100%; }
        .upload-box { background: rgba(17,24,39,0.7); border: 2px dashed rgba(148,163,184,0.2); border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.3s; }
        .upload-box:hover { border-color: #06b6d4; background: rgba(6,182,212,0.05); }
        .upload-box h3 { margin-bottom: 8px; font-size: 1.1rem; }
        .upload-box p { color: #64748b; font-size: 0.85rem; }
        .upload-box img { max-width: 100%; max-height: 120px; border-radius: 8px; margin-top: 12px; object-fit: cover; }
        .upload-box input { display: none; }
        .upload-btn { margin-top: 12px; padding: 8px 20px; border: none; border-radius: 6px; background: linear-gradient(135deg,#06b6d4,#8b5cf6); color: white; cursor: pointer; font-size: 0.85rem; }
        .upload-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .status { margin-top: 8px; font-size: 0.85rem; min-height: 20px; }
        .status.success { color: #22c55e; }
        .status.error { color: #ef4444; }
        .back-link { margin-top: 40px; color: #06b6d4; text-decoration: none; font-size: 0.9rem; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Upload <span>Portfolio Photos</span></h1>
    <p class="subtitle">Drag & drop or click to upload (Admin Auth Required)</p>
    <div class="upload-grid">
        <div class="upload-box" id="heroBox">
            <h3>🏠 Hero Photo</h3>
            <p>Main profile photo</p>
            <input type="file" id="heroInput" accept="image/*">
            <button class="upload-btn" onclick="document.getElementById('heroInput').click()">Choose File</button>
            <img id="heroPreview" style="display:none">
            <div class="status" id="heroStatus"></div>
        </div>
        <div class="upload-box" id="aboutBox">
            <h3>ℹ️ About Photo</h3>
            <p>Secondary photo</p>
            <input type="file" id="aboutInput" accept="image/*">
            <button class="upload-btn" onclick="document.getElementById('aboutInput').click()">Choose File</button>
            <img id="aboutPreview" style="display:none">
            <div class="status" id="aboutStatus"></div>
        </div>
    </div>
    <a href="/" class="back-link">← Back to Portfolio</a>
    <script>
        let adminKey = localStorage.getItem('admin_key');

        function setupUpload(boxId, inputId, previewId, statusId, filename) {
            const box = document.getElementById(boxId);
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            const status = document.getElementById(statusId);

            box.addEventListener('dragover', (ev) => { ev.preventDefault(); box.style.borderColor = '#06b6d4'; });
            box.addEventListener('dragleave', () => { box.style.borderColor = ''; });
            box.addEventListener('drop', (ev) => { ev.preventDefault(); box.style.borderColor = ''; if(ev.dataTransfer.files[0]) upload(ev.dataTransfer.files[0]); });
            input.addEventListener('change', () => { if(input.files[0]) upload(input.files[0]); });

            async function upload(file) {
                if (!adminKey) {
                    adminKey = prompt('Please enter your Admin Key for authorization:');
                    if (!adminKey) return;
                    localStorage.setItem('admin_key', adminKey);
                }

                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
                status.textContent = 'Uploading...';
                status.className = 'status';

                const formData = new FormData();
                formData.append('photo', file);
                formData.append('filename', filename);

                try {
                    const res = await fetch('/upload', { 
                        method: 'POST', 
                        headers: { 'X-Admin-Key': adminKey },
                        body: formData 
                    });
                    const data = await res.json();
                    if (res.ok) {
                        status.textContent = '✅ ' + data.message;
                        status.className = 'status success';
                    } else {
                        if (res.status === 401) {
                            localStorage.removeItem('admin_key');
                            adminKey = null;
                        }
                        status.textContent = '❌ ' + (data.error || 'Upload failed');
                        status.className = 'status error';
                    }
                } catch(err) {
                    status.textContent = '❌ Upload failed';
                    status.className = 'status error';
                }
            }
        }
        setupUpload('heroBox', 'heroInput', 'heroPreview', 'heroStatus', 'hero.jpg');
        setupUpload('aboutBox', 'aboutInput', 'aboutPreview', 'aboutStatus', 'about.jpg');
    </script>
</body>
</html>
    `);
});

// ─── File Upload Handler ───
router.post('/', requireAdmin, (req, res) => {
    upload.single('photo')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'File too large' });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`[UPLOAD] Saved: ${req.file.path}`);
        res.json({ message: `Saved as ${req.file.filename}!`, path: req.file.path });
    });
});

module.exports = router;
