import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pgService from '../database/pgService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Login
app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await pgService.login(email, password);
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Register
app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const { name, username, password, email, role, mosque_id, address } = req.body;
        
        // Validate required fields
        if (!name || !username || !password || !role || !mosque_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Only allow Imam and Muazzin roles for registration
        if (role !== 'Imam' && role !== 'Muazzin') {
            return res.status(400).json({ error: 'Invalid role. Only Imam and Muazzin can register.' });
        }

        const result = await pgService.register({
            name,
            username,
            password,
            email,
            role,
            mosque_id,
            address
        });

        if (result.success && result.user) {
            res.json(result.user);
        } else {
            res.status(400).json({ error: result.error || 'Registration failed' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get mosques
app.get('/api/mosques', async (_req: Request, res: Response) => {
    try {
        const mosques = await pgService.getMosques();
        res.json(mosques);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create mosque
app.post('/api/mosques', async (req: Request, res: Response) => {
    try {
        const mosque = await pgService.createMosque(req.body);
        res.json(mosque);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update mosque
app.put('/api/mosques/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mosque = await pgService.updateMosque(id, req.body);
        res.json(mosque);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete mosque
app.delete('/api/mosques/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pgService.deleteMosque(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get mosque summary - MUST come before the /:collection route
app.get('/api/mosques/:mosqueId/summary', async (req: Request, res: Response) => {
    try {
        const { mosqueId } = req.params;
        const summary = await pgService.getMosqueSummary(mosqueId);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get collection
app.get('/api/mosques/:mosqueId/:collection', async (req: Request, res: Response) => {
    try {
        const { mosqueId, collection } = req.params;
        const data = await pgService.getCollection(mosqueId, collection as any);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add document
app.post('/api/mosques/:mosqueId/:collection', async (req: Request, res: Response) => {
    try {
        const { mosqueId, collection } = req.params;
        const data = await pgService.addDoc(mosqueId, collection as any, req.body);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update document
app.put('/api/:collection', async (req: Request, res: Response) => {
    try {
        const { collection } = req.params;
        const data = await pgService.updateDoc(collection as any, req.body);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete document
app.delete('/api/:collection/:docId', async (req: Request, res: Response) => {
    try {
        const { collection, docId } = req.params;
        await pgService.deleteDoc(collection as any, docId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await pgService.getUserById(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by email
app.get('/api/users/email/:email', async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        const user = await pgService.getUserByEmail(email);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH profile update
app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await pgService.updateUser(id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST password change
app.post('/api/users/:id/change-password', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body ?? {};
        const result = await pgService.changePassword(id, currentPassword, newPassword);
        if (!result.success) return res.status(400).json({ error: result.error || 'Password not changed' });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

