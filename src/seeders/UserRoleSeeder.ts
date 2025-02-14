import { DataSource } from "typeorm";
import { UserRole } from "../models/UsersRole";

export const seedUserRoles = async (dataSource: DataSource) => {
  const userRoleRepository = dataSource.getRepository(UserRole);

  const existingRoles = await userRoleRepository.find();
  if (existingRoles.length > 0) {
    return;
  }

  const roles = [
    {
      role: "Admin",
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role: "User",
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role: "Read only",
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await userRoleRepository.insert(roles);
};
