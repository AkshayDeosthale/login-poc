"use server";
import * as jwt from "jsonwebtoken";

import { prisma, prismaDisconnect } from "@/script";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as algosdk from "algosdk";

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

export async function verifyAccessToken(token: string | undefined) {
  const secret = process.env.JWT_SECRET!;
  console.log(token);
  if (!token) return;
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
  const account = algosdk.generateAccount();
  const user = await prisma.user.create({
    data: {
      username: username,
      password: password,
      public_address: account.addr,
      private_key: algosdk.secretKeyToMnemonic(account.sk),
    },
  });
  console.log(user);
  await prismaDisconnect();

  revalidatePath("/signin");
  redirect(`/signin`);
};

export const createToken = async (
  asset_name: string,
  unit_name: string,
  total_supply: number,
  decimals: number
) => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const total = total_supply * 10 ** decimals;

      const algod_client = new algosdk.Algodv2(
        "",
        process.env.ALGOD_URL!,
        process.env.ALGOD_PORT
      );
      const suggestedParams = await algod_client.getTransactionParams().do();
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: wallet.public_address,
        suggestedParams,
        defaultFrozen: false,
        unitName: unit_name,
        assetName: asset_name,
        total: total_supply,
        decimals: decimals,
      });
      const signedTxn = txn.signTxn(
        algosdk.mnemonicToSecretKey(wallet.private_key).sk
      );
      try {
        await algod_client.sendRawTransaction(signedTxn).do();
        const result = await algosdk.waitForConfirmation(
          algod_client,
          txn.txID().toString(),
          3
        );
        var assetIndex = result["asset-index"];
        return { status: true, msg: `Asset ID created: ${assetIndex}` };
      } catch (e: any) {
        return { status: false, msg: e.message };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

export const getAlgoAccountBalance = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const indexer = new algosdk.Indexer('',process.env.INDEXER_URL!,process.env.INDEXER_PORT!);
      const res = await indexer.lookupAccountByID(wallet.public_address).do();
      console.log(res.account.assets)
      return {status:true,balance:res.account.amount/1000000}
    } else { 
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

export const getCreatedAssets = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const indexer = new algosdk.Indexer('',process.env.INDEXER_URL!,process.env.INDEXER_PORT!);
      const assets = []
      const res = await indexer.lookupAccountCreatedAssets(wallet.public_address).do();
      for(var i=0;i<res.assets.length;i++){
        assets.push(res.assets[i]); 
      }
      while(true){
        if(res.nextToken){
          var result = await indexer.lookupAccountCreatedAssets(wallet.public_address).nextToken(res.nextToken).do();
          for(var i=0;i<result.assets.length;i++){
            assets.push(res.assets[i]);
          }
        }else{
          break;
        }
      }
      console.log(assets)
      // return {status:true,balance:res.account.amount/1000000}
    } else { 
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

export const sendAsset = async (reciever:string,asset_id:number,amt:number) => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const indexer = new algosdk.Indexer('',process.env.INDEXER_URL!,process.env.INDEXER_PORT!);
      const assets = []
      const res = await indexer.lookupAccountCreatedAssets(wallet.public_address).do();
      for(var i=0;i<res.assets.length;i++){
        assets.push(res.assets[i]); 
      }
      while(true){
        if(res.nextToken){
          var result = await indexer.lookupAccountCreatedAssets(wallet.public_address).nextToken(res.nextToken).do();
          for(var i=0;i<result.assets.length;i++){
            assets.push(res.assets[i]);
          }
        }else{
          break;
        }
      }
      console.log(assets)
      // return {status:true,balance:res.account.amount/1000000}
    } else { 
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};
