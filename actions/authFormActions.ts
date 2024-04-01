"use server";
import * as jwt from "jsonwebtoken";

import { prisma, prismaDisconnect } from "@/script";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function generateAccessToken(user: {
  username: string;
  password: string;
}): string {
  const payload = {
    username: user.username,
    password: user.password,
  };

  const secret = process.env.JWT_SECRET!;
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET!;

  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const handleSignIn = async (formData: FormData) => {
  const username = formData.get("username")?.toString()!;
  const password = formData.get("password")?.toString()!;
  const token: string = generateAccessToken({ username, password });

  const type = "Signin account";
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (user) {
    cookies().set("authid", token, { secure: true });
    revalidatePath("/");
    redirect(`/`);
  } else {
    console.error("User not found");
  }
  await prismaDisconnect();
};

export const handleSignUp = async (formData: FormData) => {
  cookies().delete("authid");
  const username = formData.get("username")?.toString()!;
  const password = formData.get("password")?.toString()!;
  const type = "Create account";
  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  });
  await prismaDisconnect();

  revalidatePath("/signin");
  redirect(`/signin`);
};
