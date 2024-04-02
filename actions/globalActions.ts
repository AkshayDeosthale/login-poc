"use server";

import { cookies } from "next/headers";
import { getAccountBalances, verifyAccessToken } from "./authFormActions";

export async function getUserDetails() {
  try {
    const data = await getAccountBalances();
    const cookieStore = cookies();
    const isAuth = cookieStore.get("authid");
    const isJWTVerified: any = await verifyAccessToken(isAuth?.value);

    return {
      ...isJWTVerified?.data,
      ...data,
    };
  } catch (error) {
    console.log(error);
  }
}
