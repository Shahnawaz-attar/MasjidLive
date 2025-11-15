import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pgService from '../database/pgService.js';

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

// Get mosque summary
app.get('/api/mosques/:mosqueId/summary', async (req: Request, res: Response) => {
    try {
        const { mosqueId } = req.params;
        const summary = await pgService.getMosqueSummary(mosqueId);
        res.json(summary);
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

