import { Request, Response } from "express";
import { UserRole } from "../models/UsersRole";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../index";
import { Users } from "../models/UsersModel";
import { Organization } from "../models/OrganizationsModel";
import { Aircraft } from "../models/AircraftsModel";
import axios from "axios";
import moment = require("moment");
import { Sessions } from "../models/Sessions";
import { Global } from "../config/Global";

const userRepository = AppDataSource.getRepository(Users);
const roleRepository = AppDataSource.getRepository(UserRole);
const organizationRepository = AppDataSource.getRepository(Organization);
const aircraftRepository = AppDataSource.getRepository(Aircraft);

export const loginUser = async (req: Request, res: Response) => {
  try {
    const apiUrl = process.env.CLIENT_LOGIN_API + "/api/cosma/login";
    const userData = await axios.post(apiUrl, req.body);
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
      where: { org_id: userData.data.organizationId },
    });

    if (!organization) {
      const neworg_name = organizationRepository.create({
        org_id: userData.data.organizationId,
      });
      await organizationRepository.save(neworg_name);
    }

    const organization1 = await organizationRepository.findOne({
      where: { org_id: userData.data.organizationId },
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
              serial_number: userData.data.aircrafts[i].serialNumber,
            },
          });
          const data1 = {
            organization: organization1,
            serial_number: userData.data.aircrafts[i].serialNumber,
            registration_mark: userData.data.aircrafts[i].registrationMark,
            type: userData.data.aircrafts[i].type,
            manufacturer: userData.data.aircrafts[i].manufacturer,
            manufacturer_date: userData.data.aircrafts[i].manufacturerDate,
            aircraft_type: userData.data.aircrafts[i].aircraftType,
            expire_at: userData.data.aircrafts[i].expireAt,
            fuel_type: userData.data.aircrafts[i].fuelType,
            has_engine2: userData.data.aircrafts[i].hasEngine2,
            has_trip_fuel: userData.data.aircrafts[i].hasTripFuel,
            airframe_hours: userData.data.aircrafts[i].airframeHours,
            airframe_cycles: userData.data.aircrafts[i].airframeCycles,
            engine1_hours: userData.data.aircrafts[i].engine1Hours,
            engine1_n1: userData.data.aircrafts[i].engine1N1,
            engine1_n2: userData.data.aircrafts[i].engine1N2,
            engine1_imp: userData.data.aircrafts[i].engine1IMP,
            engine2_hours: userData.data.aircrafts[i].engine2Hours,
            engine2_n1: userData.data.aircrafts[i].engine2N1,
            engine2_n2: userData.data.aircrafts[i].engine2N2,
            engine2_imp: userData.data.aircrafts[i].engine2IMP,
            empyt_weight: userData.data.aircrafts[i].empytWeight,
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
    return res.status(200).json({
      status: 200,
      message: "Users successfully login",
      sessionToken: sessionToken,
      id: existingUser ? existingUser.id : loggedInUser.id,
      users: userData.data.user,
      language: existingUser ? existingUser.language : "en",
    });
  } catch (error) {
    console.error(error);
    if (!req.body.username || !req.body.password) {
      return res
        .status(401)
        .json({ status: 401, message: error.response.data });
    }
    res.status(500).json({ status: 500, message: error.response.data });
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
