import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { initDB } from './config/db.js';
import cookieParser from "cookie-parser";
import vehiclesRoutes from "./routes/vehiclesRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/owners", ownerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚗 AutoMate backend running on port ${PORT}`));
await initDB();