import HttpError from "../config/HttpError.js";

export const adminOnly = (req, res, next) => {
    if (!req.user) {
        throw new HttpError("Authentication required", 401);
    }
    
    if (req.user.role !== "admin") {
        throw new HttpError("Admin access required", 403);
    }
    
    next();
};