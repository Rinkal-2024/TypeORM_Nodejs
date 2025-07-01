import { Request, Response } from "express";
import { AppDataSource } from "../index";

import { Users } from "../models/Users";
import { LatestMovements } from "../models/LatestMovements";

const userRepository = AppDataSource.getRepository(Users);
const movementRepository = AppDataSource.getRepository(LatestMovements);

export const getMovementsData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const createdAt = req.query.createdAt as string;
    const selectUser = (req.query.selectedUser as string) || "";
    const typeString = (req.query.type as string) || "";
    const endAt = req.query.endAt as string;
    const offset = (page - 1) * limit;
    const dir = (req.query.order as any) || "";
    const field = (req.query.field as string) || "";

    const aircraftId = req.query.aircraftId
      ? parseInt(req.query.aircraftId as string)
      : null;

    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["organization", "role"],
    });

    const org_id = user.organization.id;

    const userMovementCount = await movementRepository.count({
      where: { organizationId: org_id },
    });

    if (userMovementCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No movements found for the logged-in user.",
        data: [],
      });
    }
    const query = AppDataSource.getRepository(LatestMovements)
      .createQueryBuilder("movement")
      .select([
        "MAX(movement.id) AS id",
        "movement.user_id AS user_id",
        "movement.organizationId AS organizationId",
        "movement.aircraftId AS aircraftId",
        "movement.type AS type",
        "MAX(movement.record_time) AS latest_record_time",
        "aircraft.registrationMark AS registrationMark",
        "MAX(users.last_name) AS last_name",
        "MAX(users.first_name) AS first_name",
      ])
      .leftJoin("movement.user", "users")
      .leftJoin("movement.aircraft", "aircraft")
      .where("movement.organizationId = :org_id", { org_id });

    if (user.role.role !== "Admin") {
      query.andWhere("movement.user_id = :user_id", { user_id: userId });
    }

    if (user.role.role === "Admin" && selectUser.length > 0) {
      query.andWhere("movement.user_id = :user_id", {
        user_id: parseInt(selectUser),
      });
    }

    if (typeString.length > 0) {
      query.andWhere("movement.type = :type", { type: typeString });
    }

    if (aircraftId) {
      query.andWhere("movement.aircraftId = :aircraftId", { aircraftId });
    }

    if (searchQuery) {
      query.andWhere("movement.type LIKE :searchQuery", {
        searchQuery: `%${searchQuery}%`,
      });
    }

    if (createdAt && endAt) {
      query.andWhere("movement.created_at BETWEEN :start AND :end", {
        start: new Date(createdAt),
        end: new Date(endAt),
      });
    } else if (createdAt) {
      query.andWhere("movement.created_at >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      query.andWhere("movement.created_at <= :end", {
        end: new Date(endAt),
      });
    }

    query.groupBy(
      "movement.user_id, movement.aircraftId, movement.type, aircraft.registrationMark, movement.record_time"
    );

    if (field.length > 0 && dir.length > 0) {
      query.addOrderBy(field, dir.toUpperCase()).offset(offset).limit(limit);
    } else {
      query.orderBy("latest_record_time", "DESC").offset(offset).limit(limit);
    }

    const movementsData = await query.getRawMany();

    const totalCountQuery = AppDataSource.getRepository(LatestMovements)
      .createQueryBuilder("movement")
      .select(
        "COUNT(DISTINCT CONCAT(movement.user_id, '-', movement.aircraftId, '-', movement.type, '-', movement.record_time))",
        "totalCount"
      )
      .leftJoin("movement.aircraft", "aircraft")
      .where("movement.organizationId = :org_id", { org_id });

    if (user.role.role !== "Admin") {
      totalCountQuery.andWhere("movement.user_id = :user_id", {
        user_id: userId,
      });
    }

    if (user.role.role === "Admin" && selectUser.length > 0) {
      totalCountQuery.andWhere("movement.user_id = :user_id", {
        user_id: parseInt(selectUser),
      });
    }
    if (typeString.length > 0) {
      totalCountQuery.andWhere("movement.type = :type", { type: typeString });
    }

    if (aircraftId) {
      totalCountQuery.andWhere("movement.aircraftId = :aircraftId", {
        aircraftId,
      });
    }

    if (searchQuery) {
      totalCountQuery.andWhere("movement.type LIKE :searchQuery", {
        searchQuery: `%${searchQuery}%`,
      });
    }

    if (createdAt && endAt) {
      totalCountQuery.andWhere("movement.created_at BETWEEN :start AND :end", {
        start: new Date(createdAt),
        end: new Date(endAt),
      });
    } else if (createdAt) {
      totalCountQuery.andWhere("movement.created_at >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      totalCountQuery.andWhere("movement.created_at <= :end", {
        end: new Date(endAt),
      });
    }

    const totalResult = await totalCountQuery.getRawOne();
    const totalRecords = parseInt(totalResult?.totalCount || "0", 10);
    if (!movementsData || movementsData.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No movements found matching the provided filters.",
        data: [],
        totalRecords: 0,
        totalPages: 0,
        page,
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Movements retrieved successfully.",
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data: movementsData,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const distinctMovementType = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const getUser = await AppDataSource.getRepository(Users).findOne({
      where: { id: userId },
    });

    if (!getUser) {
      return res
        .status(404)
        .json({ status: 404, message: "No User Found!!!!!" });
    }

    const distinctValues = await AppDataSource.getRepository(LatestMovements)
      .createQueryBuilder("movement")
      .select("DISTINCT movement.type AS type")
      .where("movement.organizationId = :organizationId", {
        organizationId: getUser.organizationId,
      })
      .getRawMany();

    return res.status(201).json({
      status: 201,
      data: distinctValues,
      message: "movement types fetched",
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
