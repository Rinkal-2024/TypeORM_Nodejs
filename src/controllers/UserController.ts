import { Request, Response } from "express";
import { UserRole } from "../models/UsersRole";
import { generateToken } from "../config/jwt";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../index";
import { Users } from "../models/UsersModel";
import { Organization } from "../models/OrganizationsModel";
import { Aircraft } from "../models/AircraftsModel";
import axios from "axios";
import { UserRoleEnum } from "../enumerations/UserEnum";

const userRepository = AppDataSource.getRepository(Users);
const roleRepository = AppDataSource.getRepository(UserRole);
const organizationRepository = AppDataSource.getRepository(Organization);
const aircraftRepository = AppDataSource.getRepository(Aircraft);

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { org_id, role, first_name, last_name, mobile, email, password } =
      req.body;

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const userRole = await roleRepository.findOne({
      where: { role: role || UserRoleEnum.USER },
    });
    const organization = await organizationRepository.findOne({
      where: { id:org_id},
    });

    // if (!organization) {
    //   return res.status(400).json({ message: "Invalid organization name" });
    // }
    if (!userRole)
      return res.status(400).json({ message: "Invalid role selected" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      organization,
      role: userRole,
      first_name,
      last_name,
      mobile,
      email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await userRepository.save(newUser);

    const token = generateToken(
      {
        email: newUser.email,
      },
      res
    );

    res.status(201).json({
      email: newUser.email,
      role: newUser.role.role,
      organization: newUser.organization.org_id,
      token,
      message: "User added successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOne({
      where: { email },
      relations: ["role", "organization", "organization.aircrafts"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(
      {
        email: user.email,
      },
      res
    );
    const aircraftsWithoutOrgId = user.organization.aircrafts.map(
      ({ org_id, ...aircraft }) => aircraft
    );
    res.status(200).json({
      sessionToken: token,
      organizationId: user.organization.org_id,
      user: {
        username: user.email,
     
      },
      aircrafts: aircraftsWithoutOrgId,

      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const addlanguage = async (req: Request, res: Response) => {
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
