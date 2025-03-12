import { Request, Response, NextFunction } from "express";
// import { verifyToken } from "../config/jwt";
import { AppDataSource } from "../index";
import { _verifyJWTToken } from "./auth";
import { Sessions } from "../models/Sessions";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      aircrafts?: any;
    }
  }
}

export const authMiddlewareController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("X-Access-Token");

    if (!token) {
      return res.status(410).send("Invalid session token provided.");
    }
    const sessionRepository = AppDataSource.getRepository(Sessions);
    const existingSession = await sessionRepository
      .createQueryBuilder("session")
      .where("session.token = :sessionToken", { sessionToken: token })
      .andWhere("session.loggedOutAt IS NULL")
      .getOne();
    // const existingSession: any = await getExistingSession(token);
    if (!existingSession) {
      return res.status(400).send("Invalid session token provided");
    }
    _verifyJWTToken(token)
      .then(async (decodedToken: any) => {
        req.user = existingSession;

        // existingSession[0].updatedAt = moment().format(Global.UTC_DATE_TIME_FORMAT);
        // await updateSessionToken(existingSession[0]);
        next();
      })
      .catch(async (err: any) => {
        if (err.name === "TokenExpiredError") {
          // existingSession[0].deletedAt = moment().format(Global.UTC_DATE_TIME_FORMAT);
          // await updateSessionToken(existingSession[0]);
          return res.status(409).json("Session token expired.");
        } else {
          return res.status(410).send("Invalid session token provided.");
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("There was a problem with retrieving the token!");
  }
};
