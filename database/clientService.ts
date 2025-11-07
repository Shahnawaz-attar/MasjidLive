// Browser-safe database client — delegates to mockDb for client-side usage
import { db as mockDb } from '../mockDb';

// Export same surface as server dbService so UI code can use the same API
export default mockDb;