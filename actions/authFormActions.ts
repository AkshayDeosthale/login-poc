"use server";

import { prisma, prismaDisconnect } from "@/script";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const handleSignIn = async (formData: FormData) => {
  const username = formData.get("username")?.toString()!;
  const password = formData.get("password")?.toString()!;
  const type = "Signin account";
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (user) {
    cookies().set("authid", `${username}-${password}`, { secure: true });
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
