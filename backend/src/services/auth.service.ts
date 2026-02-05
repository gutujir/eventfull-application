import bcryptjs from "bcryptjs";
import * as authDal from "../dal/auth.dal";
import { Prisma } from "../../generated/prisma";

export const registerUser = async (data: Prisma.UserCreateInput) => {
  const { email, password, first_name, last_name } = data;

  const userAlreadyExists = await authDal.findUserByEmail(email);

  if (userAlreadyExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const newUser = await authDal.createUser({
    email,
    password: hashedPassword,
    first_name,
    last_name,
  });

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  const user = await authDal.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcryptjs.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: Prisma.UserUpdateInput,
) => {
  const updatedUser = await authDal.updateUser(userId, data);
  return updatedUser;
};
