"use server";

import { cookies } from "next/headers";
import { getAccountBalances, verifyAccessToken } from "./authFormActions";
import { UserData } from "@/components/Header";

export async function getUserDetails() {
  try {
    const data = await getAccountBalances();

    const cookieStore = cookies();
    const isAuth = cookieStore.get("authid");
    const isJWTVerified: any = await verifyAccessToken(isAuth?.value);
    const obj: UserData = {
      ...isJWTVerified?.data,
      ...data,
    };

    return {
      ...isJWTVerified?.data,
      ...data,
    };
  } catch (error) {
    console.log(error);
  }
}
