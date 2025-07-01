import { Request, Response } from "express";
import { AppDataSource } from "../index";
import { Aircrafts } from "../models/Aircrafts";
import { Users } from "../models/Users";

export const getAircrafts = async (req: Request, res: Response) => {
  try {
    const aircraftRepository = AppDataSource.getRepository(Aircrafts);
    const userRepository = AppDataSource.getRepository(Users);
    const userId = req.user.userId;

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["organizationId"],
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const aircrafts = await aircraftRepository.find({
      where: { organizationId: user.organizationId },
    });
    const aircraftTyps = await aircraftRepository
      .createQueryBuilder("aircrafts")
      .select("MIN(aircrafts.id)", "id")
      .addSelect("aircrafts.aircraftType", "aircraftType")
      .addSelect("MAX(aircrafts.manufacturer)", "manufacturer")
      .where("aircrafts.organizationId = :orgId", {
        orgId: user.organizationId,
      })
      .groupBy(
        "aircrafts.aircraftType, aircrafts.manufacturer,aircrafts.organizationId "
      )
      .getRawMany();
    return res.status(200).json({
      status: 200,
      message: "Aircrafts retrieved successfully",
      data: aircrafts,
      aircraftTyps: aircraftTyps,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
