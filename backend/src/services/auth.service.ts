import bcryptjs from "bcryptjs";
import * as authDal from "../dal/auth.dal";
import { Prisma } from "../../generated/prisma";

export const registerUser = async (data: Prisma.UserCreateInput) => {
  const { email, password } = data as any;

  const userAlreadyExists = await authDal.findUserByEmail(email);

  if (userAlreadyExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  // Include any optional profile fields passed in `data` when creating the user
  const createData: any = { ...data, password: hashedPassword };

  const newUser = await authDal.createUser(
    createData as Prisma.UserCreateInput,
  );

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
