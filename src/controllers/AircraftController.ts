import { Request, Response } from "express";
import { AppDataSource } from "../index";
import { Aircraft } from "../models/AircraftsModel";
import { Users } from "../models/UsersModel";

export const getAircrafts = async (req: Request, res: Response) => {
  try {
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    const userRepository = AppDataSource.getRepository(Users);
    const userId = req.user.userId;

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["org_id"],
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const aircrafts = await aircraftRepository.find({
      where: { org_id: user.org_id },
    });

    return res.status(200).json({
      status: 200,
      message: "Aircrafts retrieved successfully",
      data: aircrafts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
