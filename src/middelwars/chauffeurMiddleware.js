import HttpError from "../config/HttpError.js";

export const chauffeurOnly = (req, res, next) => {
    if (!req.user) {
        throw new HttpError("Authentication required", 401);
    }
    
    if (req.user.role !== "Chauffeur") {
        throw new HttpError("Chauffeur access required", 403);
    }
    
    next();
};