import { verifyToken } from "../utils/verifyToken";
import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

export const isAzureServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                error: true,
                message: "Unauthorized"
            });
        }
        const authToken = req.headers.authorization;
        const unsealed = await verifyToken(authToken, "SIH-server-azure");
        if (unsealed.error) {
            return res.status(400).json({
                error: true,
                message: unsealed.message
            });
        }
        next();
    }
    catch (err) {
        Sentry.captureException(err);
        await Sentry.flush(2000);
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};