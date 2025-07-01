import { Request, Response } from "express";
import { UserRoles } from "../models/UserRoles";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../index";
import { Users } from "../models/Users";
import { Organizations } from "../models/Organizations";
import { Aircrafts } from "../models/Aircrafts";
import axios from "axios";
import moment = require("moment");
import { Sessions } from "../models/Sessions";
import { Global } from "../config/Global";

const userRepository = AppDataSource.getRepository(Users);
const roleRepository = AppDataSource.getRepository(UserRoles);
const organizationRepository = AppDataSource.getRepository(Organizations);
const aircraftRepository = AppDataSource.getRepository(Aircrafts);

export const loginUser = async (req: Request, res: Response) => {
  try {
    const decodedPassword = Buffer.from(req.body.password, "base64").toString(
      "utf-8"
    );

    const apiUrl = process.env.CLIENT_LOGIN_API + "/api/cosma/login";
    const userData = await axios.post(apiUrl, {
      username: req.body.username,
      password: decodedPassword,
    });

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      parseInt(process.env.HASH_SALT)
    );

    const existingUser = await userRepository.findOne({
      where: {
        email: userData.data.user.username,
      },
    });

    const userRole = await roleRepository.findOne({
      where: { role: userData.data.user.accountType },
    });

    const organization = await organizationRepository.findOne({
      where: { organizationId: userData.data.organizationId },
    });

    if (!organization) {
      const neworg_name = organizationRepository.create({
        organizationId: userData.data.organizationId,
      });
      await organizationRepository.save(neworg_name);
    }

    const organization1 = await organizationRepository.findOne({
      where: { organizationId: userData.data.organizationId },
    });

    let loggedInUser = undefined;

    if (existingUser) {
      userRepository.merge(existingUser, {
        organization,
        role: userRole,
        first_name: userData.data.user.firstName,
        last_name: userData.data.user.lastName,
        mobile: "",
        email: userData.data.user.username,
        password: hashedPassword,
      });
      await userRepository.save(existingUser);
      loggedInUser = existingUser;
    } else {
      const newUser = userRepository.create({
        organization: organization1,
        role: userRole,
        first_name: userData.data.user.firstName,
        last_name: userData.data.user.lastName,
        mobile: "",
        email: userData.data.user.username,
        password: hashedPassword,
      });
      await userRepository.save(newUser);
      loggedInUser = newUser;
    }

    if (Object.prototype.hasOwnProperty.call(userData.data, "aircrafts")) {
      if (Array.isArray(userData.data.aircrafts)) {
        for (let i = 0; i < userData.data.aircrafts.length; i++) {
          const aircraft = await aircraftRepository.findOne({
            where: {
              serialNumber: userData.data.aircrafts[i].serialNumber,
            },
          });
          console.log(
            " userData.data.aircrafts[i].airframeCycles",
            userData.data.aircrafts[i].serialNumber
          );

          const data1 = {
            organization: organization1,
            serialNumber: userData.data.aircrafts[i].serialNumber,
            registrationMark: userData.data.aircrafts[i].registrationMark,
            type: userData.data.aircrafts[i].type,
            manufacturer: userData.data.aircrafts[i].manufacturer,
            manufacturerDate: userData.data.aircrafts[i].manufacturerDate,
            aircraftType: userData.data.aircrafts[i].aircraftType,
            expiredAt: userData.data.aircrafts[i].expireAt,
            fuelType: userData.data.aircrafts[i].fuelType,
            hasEngine2: userData.data.aircrafts[i].hasEngine2,
            hasTripFuel: userData.data.aircrafts[i].hasTripFuel,
            airframeHours: userData.data.aircrafts[i].airframeHours,
            airframeCycles: userData.data.aircrafts[i].airframeCycles || null,
            engine1Hours: userData.data.aircrafts[i].engine1Hours,
            engine1N1: userData.data.aircrafts[i].engine1N1,
            engine1N2: userData.data.aircrafts[i].engine1N2,
            engine1IMP: userData.data.aircrafts[i].engine1IMP,
            engine2Hours: userData.data.aircrafts[i].engine2Hours,
            engine2N1: userData.data.aircrafts[i].engine2N1,
            engine2N2: userData.data.aircrafts[i].engine2N2,
            engine2IMP: userData.data.aircrafts[i].engine2IMP,
            empytWeight: userData.data.aircrafts[i].empytWeight,
          };
          if (aircraft) {
            aircraftRepository.merge(aircraft, data1);
            await aircraftRepository.save(aircraft);
          } else {
            await aircraftRepository.save(data1);
          }
        }
      }
    }

    const sessionToken = userData.data.sessionToken;
    if (sessionToken) {
      const session = new Sessions();
      session.token = sessionToken;
      session.loginAt = moment().format(Global.UTC_DATE_TIME_FORMAT);
      session.user = loggedInUser;
      await AppDataSource.getRepository(Sessions).save(session);
    }

    const responseData: any = {
      status: 200,
      message: "Users successfully login",
      sessionToken: sessionToken,
      id: existingUser ? existingUser.id : loggedInUser.id,
      users: userData.data.user,
      aircrafts: userData.data.aircrafts,
      language: existingUser ? existingUser.language : "en",
    };

    if (userData.data.user.accountType === "Admin") {
      responseData.subusers = (userData.data.users || []).filter(
        (subuser: any) => subuser.accountType !== "Admin"
      );
    }

    return res.status(200).json(responseData);
  } catch (error) {
    if (error) {
      return res
        .status(401)
        .json({ status: 401, message: error.response.data });
    }
    res.status(500).json({ status: 500, message: "Something Went Wrong" });
  }
};

export const logOut = async (req: Request, res: Response) => {
  try {
    const { token, loggedOutAt } = req.body;
    const sessionRepository = AppDataSource.getRepository(Sessions);

    const session = await sessionRepository.findOne({
      where: { token: token },
    });

    if (!session) {
      return res.status(404).json({
        status: 404,
        message: "Token is not found",
      });
    }

    session.loggedOutAt = moment(loggedOutAt).format(
      Global.UTC_DATE_TIME_FORMAT
    );

    await sessionRepository.save(session);

    return res.json({
      status: 200,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};
export const addLanguages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { language } = req.body;
  if (!language || language.length !== 2) {
    return res.status(400).json({
      status: 400,
      message: "Invalid language format. Use a 2-letter code.",
    });
  }

  try {
    const user = await userRepository.findOne({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }

    user.language = language;

    await userRepository.save(user);

    res
      .status(200)
      .json({ status: 200, message: "Language updated successfully.", user });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const { old_password, new_password } = req.body;

    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found!!!!!" });
    }

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      user.password
    );
    if (!isOldPasswordValid) {
      return res
        .status(400)
        .json({ status: 400, message: "Old password is incorrect !!!!" });
    }

    const isNewPasswordValid = await bcrypt.compare(
      new_password,
      user.password
    );

    if (isNewPasswordValid) {
      return res.status(409).json({
        status: 409,
        message: "Your new password can not be same as old password !!!!!",
      });
    }

    const hashedNewPassword = await bcrypt.hash(
      new_password,
      parseInt(process.env.HASH_SALT)
    );

    user.password = hashedNewPassword;

    await userRepository.save(user);
    return res
      .status(200)
      .json({ status: 200, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

export const organizationPeople = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const getUser = await userRepository.findOne({
      where: { id: userId },
      relations: ["organization", "role"],
    });

    if (!getUser) {
      return res
        .status(404)
        .json({ status: 404, message: "No User Found!!!!!" });
    }

    delete getUser.password;

    const findAllUser = await userRepository.find({
      where: { organizationId: getUser.organizationId },
      relations: ["organization", "role"],
    });

    const finalData = findAllUser.map((item: any) => {
      delete item.password;
      return item;
    });

    return res.status(201).json({
      status: 201,
      data: finalData,
      currentUser: getUser,
      message: "users based on organization fetched successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
