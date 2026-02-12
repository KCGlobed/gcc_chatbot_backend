import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ChatController } from './controllers/ChatController';
import * as dotenv from 'dotenv';
dotenv.config();

export class App {
    public app: Application;
    private chatController: ChatController;

    constructor() {
        this.app = express();
        this.config();

        this.chatController = new ChatController();
        this.routes();
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));

        // Request Logger Middleware
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            const dbService = new (require('./services/DatabaseService').DatabaseService)(); // Lazy load to avoid circular dep issues if any, or just import

            res.on("finish", () => {
                const durationMs = Date.now() - startTime;
                dbService.logEvent("HTTP_REQUEST", {
                    method: req.method,
                    route: req.originalUrl,
                    status: res.statusCode,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                    durationMs
                });
            });
            next();
        });
    }

    private routes(): void {
        this.app.post('/api/chat', this.chatController.handleChat);
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'UP',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                system: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    pid: process.pid
                }
            });
        });
    }
}
