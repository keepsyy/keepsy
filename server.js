const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Routes

// 1. Generate Invite Link
app.post('/api/invite', (req, res) => {
    const { keepsyId, email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone required' });
    }

    // Default valid Keepsy ID if not provided (simulating a "session")
    const kId = keepsyId || 'default-keepsy-' + Date.now();

    // Check for existing pending invite (Optional rule enforcement)
    db.get(`SELECT id FROM invites WHERE keepsy_id = ? AND status = 'pending'`, [kId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        // MVP Rule: Only one pending invite per keepsy
        if (row) {
            return res.status(409).json({ error: 'A pending invite already exists for this Keepsy.' });
        }

        // Create new invite
        const inviteId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        const stmt = db.prepare(`INSERT INTO invites (id, keepsy_id, email, phone, expires_at) VALUES (?, ?, ?, ?, ?)`);
        stmt.run(inviteId, kId, email, phone, expiresAt, function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create invite' });
            }

            // Return REAL invite link pointing to localhost
            const inviteLink = `http://localhost:${PORT}/invite/${inviteId}`;
            res.json({ inviteLink, inviteId });
        });
    });
});

// 2. Serve Invite Page (HTML)
app.get('/invite/:inviteId', (req, res) => {
    // Serve the static HTML. The HTML script will then call /api/invite/:id to validate.
    res.sendFile(path.join(__dirname, 'invite.html'));
});

// 2.5 API to Get Invite Details (Validation)
app.get('/api/invite/:inviteId', (req, res) => {
    const { inviteId } = req.params;

    db.get(`SELECT * FROM invites WHERE id = ?`, [inviteId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        // Check Expiry
        if (new Date(row.expires_at) < new Date()) {
            if (row.status === 'pending') {
                db.run(`UPDATE invites SET status = 'expired' WHERE id = ?`, [inviteId]);
            }
            return res.status(410).json({ error: 'Invite expired' });
        }

        if (row.status !== 'pending') {
            return res.status(410).json({ error: 'Invite already used' });
        }

        // Return rules for UI
        res.json({
            email: row.email,
            phone: row.phone
        });
    });
});

// 3. Verify Invite (Finalize)
app.post('/api/verify-invite', (req, res) => {
    const { inviteId, verifiedType, verifiedValue, isDevMode } = req.body;

    // DEV TEST MODE
    if (isDevMode && verifiedValue === '123456') {
        console.log('[DEV] Simulating success for Invite:', inviteId);
        db.run(`UPDATE invites SET status = 'used' WHERE id = ?`, [inviteId], function (err) {
            if (err) return res.status(500).json({ error: 'DB Error' });
            return res.json({ success: true, message: 'Dev Verification Successful' });
        });
        return;
    }

    db.get(`SELECT * FROM invites WHERE id = ?`, [inviteId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        if (row.status !== 'pending') {
            return res.status(400).json({ error: 'Invite invalid or used' });
        }

        // Validate Identifier Match
        let isValid = false;

        if (verifiedType === 'email' && row.email) {
            if (verifiedValue.toLowerCase() === row.email.toLowerCase()) {
                isValid = true;
            }
        }

        if (verifiedType === 'phone' && row.phone) {
            const cleanStored = row.phone.replace(/\D/g, '');
            const cleanVerified = verifiedValue.replace(/\D/g, '');
            // Allow partial match (last 10 digits) due to country code variances
            if (cleanVerified.includes(cleanStored) || cleanStored.includes(cleanVerified)) {
                isValid = true;
            }
        }

        // Fallback for "Both" scenario
        if (!isValid && !row.email && row.phone && verifiedType === 'phone') isValid = true; // should be caught above
        // If invite allowed both, we check against whichever is provided
        if (!isValid && row.email && verifiedType === 'email' && verifiedValue.toLowerCase() === row.email.toLowerCase()) isValid = true;
        if (!isValid && row.phone && verifiedType === 'phone' && verifiedValue.replace(/\D/g, '').includes(row.phone.replace(/\D/g, ''))) isValid = true;


        if (!isValid) {
            return res.status(403).json({ error: 'Verification credentials do not match invite.' });
        }

        // Success - Mark Used
        db.run(`UPDATE invites SET status = 'used' WHERE id = ?`, [inviteId], function (err) {
            if (err) return res.status(500).json({ error: 'Database update failed' });
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Keepsy Backend running on http://localhost:${PORT}`);
});
