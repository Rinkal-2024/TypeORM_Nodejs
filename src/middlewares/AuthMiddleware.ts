import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { Users } from "../models/UsersModel";
import { AppDataSource } from "../index";
import { Aircraft } from "../models/AircraftsModel";
declare global {
  namespace Express {
    interface Request {
      user?: any;
      aircrafts?: any;
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;
  //  const token = req.body.token;
  if (!token) {
    return res
      .status(401)
      .json({ status: 401, message: "Access denied, no token provided" });
  }

  try {
    const decoded: any = verifyToken(token);
    const userRepository = AppDataSource.getRepository(Users);
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    const existingUser = await userRepository.findOne({
      where: {
        email: decoded.user.email,
      },
    });
    if (existingUser !== null) {
      const userAircrafts = await aircraftRepository.find({
        where: { org_id: existingUser.org_id }, // Use org_id to find aircrafts
      });
      req.user = existingUser;
      req.aircrafts = userAircrafts;
      next();
    } else {
      res.status(401).json({ status: 401, message: "No user Found" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "Invalid or expired token" });
  }
};
