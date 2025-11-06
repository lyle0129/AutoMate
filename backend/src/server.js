import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { initDB } from './config/db.js';
import cookieParser from "cookie-parser";
import vehiclesRoutes from "./routes/vehiclesRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import maintenanceLogRoutes from "./routes/maintenanceLogRoutes.js";

dotenv.config();


const app = express();

// CORS configuration for frontend communication with credentials
// ✅ Updated CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://v-garage.vercel.app' // your deployed frontend
    ],
    credentials: true, // allow cookies / auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/maintenance", maintenanceLogRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚗 AutoMate backend running on port ${PORT}`));
await initDB();