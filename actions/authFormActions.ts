"use server";
import * as jwt from "jsonwebtoken";

import { prisma, prismaDisconnect } from "@/script";
import * as algosdk from "algosdk";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDetails } from "./globalActions";

export type AssetType =
  | {
      status: boolean;
      assets: {
        id: any;
        decimals: any;
        name: any;
        unit_name: any;
        balance: number;
      }[];
      msg?: undefined;
    }
  | { status: boolean; msg: string; assets?: undefined };

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

  if (!token) return;
  try {
    const decoded = jwt.verify(token, secret);

    return { success: true, data: decoded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const handleSignIn = async (username: string, password: string) => {
  const token: string = generateAccessToken({
    username,
    password,
  });

  const type = "Signin account";
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  await prismaDisconnect();
  if (user) {
    cookies().set("authid", token, { secure: true });

    const userData = await getUserDetails();
    return {
      status: true,
      message: "User Logged In",
      data: userData,
    };
  } else {
    return {
      status: false,
      message: "User not found",
    };
  }
};

const transferTestTokens = async (reciever: string) => {
  const mastet_private =
    "step fury fatigue brick recall more level ignore explain figure diary van opinion antique grief when wild hockey breeze enforce cherry buffalo now ability upset";
  const account = algosdk.mnemonicToSecretKey(mastet_private);
  const algod_client = new algosdk.Algodv2(
    "",
    process.env.ALGOD_URL!,
    process.env.ALGOD_PORT
  );
  const suggestedParams = await algod_client.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: reciever,
    suggestedParams,
    amount: 5000000,
  });
  const signedXferTxn = xferTxn.signTxn(account.sk);
  try {
    await algod_client.sendRawTransaction(signedXferTxn).do();
    const result = await algosdk.waitForConfirmation(
      algod_client,
      xferTxn.txID().toString(),
      3
    );
    var confirmedRound = result["confirmed-round"];
    return true;
  } catch (e: any) {
    return false;
  }
};

export const handleSignUp = async (
  username: string,
  password: string,
  canTransact: boolean
) => {
  cookies().delete("authid");

  const account = algosdk.generateAccount();
  const user = await prisma.user.create({
    data: {
      username: username,
      password: password,
      public_address: account.addr,
      private_key: algosdk.secretKeyToMnemonic(account.sk),
      canTransact: canTransact,
    },
  });
  await prismaDisconnect();
  if (user) {
    var res = await transferTestTokens(account.addr);
    var msg = "User Ceated " + (res == true) ? "& Added 5 Algos" : "";
    return {
      status: true,
      message: msg,
      data: user,
    };
  } else {
    return {
      status: false,
      message: "User not created",
    };
  }
};

export async function createToken(
  asset_name: string,
  unit_name: string,
  total_supply: number,
  decimals: number
) {
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
        total: total,
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
        revalidatePath("/");

        return {
          status: true,
          msg: `Asset ID created: ${assetIndex}`,
          tx_url: `https://testnet.explorer.perawallet.app/tx/${txn.txID()}`,
        };
      } catch (e: any) {
        return { status: false, msg: e.message };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
}

export const getAccountBalances = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });

    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      var res;
      try {
        res = await indexer.lookupAccountByID(wallet.public_address).do();

        var assets = [];

        if (res.account.assets) {
          for (var i = 0; i < res.account.assets.length; i++) {
            var id = res.account.assets[i]["asset-id"];
            var amount = res.account.assets[i].amount;
            var re = await indexer.lookupAssetByID(id).do();
            var decimals = re.asset.params.decimals;
            var name = re.asset.params.name;
            var unit = re.asset.params["unit-name"];
            var balance = amount / 10 ** decimals;
            assets.push({ id, name, unit, balance, decimals });
          }
        }

        return {
          status: true,
          balance: res.account.amount / 1000000,
          address: wallet.public_address,
          assets: assets,
          canTransact: wallet.canTransact,
        };
      } catch (e: any) {
        return {
          status: true,
          balance: 0,
          address: wallet.public_address,
          assets: [],
          canTransact: wallet.canTransact,
        };
      }
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
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      let assets = [];
      var res = await indexer
        .lookupAccountCreatedAssets(wallet.public_address)
        .do();
      for (var i = 0; i < res.assets.length; i++) {
        assets.push(res.assets[i]);
      }
      while (true) {
        if (res.nextToken) {
          var result = await indexer
            .lookupAccountCreatedAssets(wallet.public_address)
            .nextToken(res.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            assets.push(result.assets[i]);
          }
        } else {
          break;
        }
      }
      const balances = [];
      var res = await indexer.lookupAccountAssets(wallet.public_address).do();
      for (var i = 0; i < res.assets.length; i++) {
        balances.push({
          amount: res.assets[i].amount,
          "asset-id": res.assets[i]["asset-id"],
        });
      }
      while (true) {
        if (res.nextToken) {
          var result = await indexer
            .lookupAccountAssets(wallet.public_address)
            .nextToken(res.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            balances.push({
              amount: result.assets[i].amount,
              "asset-id": result.assets[i]["asset-id"],
            });
          }
        } else {
          break;
        }
      }

      var filtered_assets = [];
      for (var i = 0; i < assets.length; i++) {
        var id = assets[i]["index"];
        var decimals = assets[i].params.decimals;
        var name = assets[i].params.name;
        var unit_name = assets[i].params["unit-name"];
        var bal = balances.filter((ele) => {
          return ele["asset-id"] == id;
        });
        if (bal.length > 0) {
          var balance = bal[0].amount / 10 ** decimals;
        } else {
          var balance = 0;
        }
        filtered_assets.push({ id, decimals, name, unit_name, balance });
      }

      return { status: true, assets: filtered_assets };
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

const checkAddressOrigin = async (address: string) => {
  const wallet = await prisma.user.findFirst({
    where: {
      public_address: address,
    },
  });
  if (wallet) {
    return { status: true, wallet: wallet };
  } else {
    return { status: false };
  }
};

const checkAddressisOptedToAsset = async (
  reciever: string,
  asset_id: number
) => {
  const indexer = new algosdk.Indexer(
    "",
    process.env.INDEXER_URL!,
    process.env.INDEXER_PORT!
  );
  const q = indexer.lookupAccountAssets(reciever);
  q.query = { "asset-id": asset_id };
  const account_details = await q.do();
  if (account_details.assets.length > 0) {
    return true;
  } else {
    return false;
  }
};

export const sendAsset = async (
  reciever: string,
  asset_id: number,
  amt: number
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
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      const asset_details = await indexer.lookupAssetByID(asset_id).do();
      const res = indexer.lookupAccountAssets(wallet.public_address);
      res.query = { "asset-id": asset_id };
      const result = await res.do();
      if (result.assets.length > 0) {
        const asset = result.assets[0];
        amt = amt * 10 ** asset_details.asset.params.decimals;
        if (amt <= asset.amount) {
          const isopted = await checkAddressisOptedToAsset(reciever, asset_id);
          const add_origin = await checkAddressOrigin(reciever);
          if (!isopted && !add_origin.status) {
            return {
              status: false,
              msg: "Reciever Account Not Optedin to the asset and his account is not from our org to initiate opt in",
            };
          } else {
            const algod_client = new algosdk.Algodv2(
              "",
              process.env.ALGOD_URL!,
              process.env.ALGOD_PORT
            );
            const suggestedParams = await algod_client
              .getTransactionParams()
              .do();
            if (isopted) {
              const xferTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: wallet.public_address,
                  to: reciever,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: amt,
                });
              const signedXferTxn = xferTxn.signTxn(
                algosdk.mnemonicToSecretKey(wallet.private_key).sk
              );
              try {
                await algod_client.sendRawTransaction(signedXferTxn).do();
                const result = await algosdk.waitForConfirmation(
                  algod_client,
                  xferTxn.txID().toString(),
                  3
                );
                var confirmedRound = result["confirmed-round"];
                return {
                  status: true,
                  msg: `Transaction Successful in Round ${confirmedRound}`,
                  tx_url: `https://testnet.explorer.perawallet.app/tx/${xferTxn.txID()}`,
                };
              } catch (e: any) {
                return { status: false, msg: e.message };
              }
            } else {
              const atc = new algosdk.AtomicTransactionComposer();
              suggestedParams.fee = 0;
              suggestedParams.flatFee = true;
              const optInTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: add_origin.wallet?.public_address!,
                  to: add_origin.wallet?.public_address!,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: 0,
                });
              suggestedParams.fee = 2 * 1000;
              suggestedParams.flatFee = true;
              const xferTxn =
                algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                  from: wallet.public_address,
                  to: reciever,
                  suggestedParams,
                  assetIndex: asset_id,
                  amount: amt,
                });
              const receiver_signer = algosdk.makeBasicAccountTransactionSigner(
                algosdk.mnemonicToSecretKey(add_origin.wallet?.private_key!)
              );
              atc.addTransaction({ txn: optInTxn, signer: receiver_signer });
              const sender_signer = algosdk.makeBasicAccountTransactionSigner(
                algosdk.mnemonicToSecretKey(wallet.private_key)
              );
              atc.addTransaction({ txn: xferTxn, signer: sender_signer });
              try {
                const result = await atc.execute(algod_client, 4);
                revalidatePath("/transfer-assets");
                return {
                  status: true,
                  msg: `Transaction successful in Round ${result.confirmedRound}`,
                  tx_url: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[1]}`,
                };
              } catch (e: any) {
                return { status: false, msg: e.message };
              }
            }
          }
        } else {
          return { status: false, msg: "Insufficient Amount in the account" };
        }
      } else {
        return { status: false, msg: "This account hasn't created this asset" };
      }

      // return {status:true,balance:res.account.amount/1000000}
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

export const getAccountAssets = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });

    if (wallet) {
      const indexer = new algosdk.Indexer(
        "",
        process.env.INDEXER_URL!,
        process.env.INDEXER_PORT!
      );
      var assets :any = [
        {
          type: "ft",
          name: "Fungible Token",
          assets: [],
        },
        {
          type: "nft",
          name: "Non Fungible Token",
          assets: [],
        },
      ];
      var temp_assets = [];
      var assets_result = await indexer
        .lookupAccountAssets(wallet.public_address)
        .do();
      for (var i = 0; i < assets_result.assets.length; i++) {
        temp_assets.push(assets_result.assets[i]);
      }
      while (true) {
        if (assets_result.nextToken) {
          var result = await indexer
            .lookupAccountAssets(wallet.public_address)
            .nextToken(assets_result.nextToken)
            .do();
          for (var i = 0; i < result.assets.length; i++) {
            temp_assets.push(result.assets[i]);
          }
        } else {
          break;
        }
      }
      const all_asset_ids = [];
      var all_assets : any = {};
      for(var i=0;i<temp_assets.length;i++){
        all_asset_ids.push(temp_assets[i]['asset-id']);
        all_assets[temp_assets[i]['asset-id']] = temp_assets[i];
      }
      var db_res = await prisma.assetDetails.findMany({
        where:{
          assetId:{
            in: all_asset_ids
          }
        }
      });
      var completed_assets : any = [];
      for(var i=0;i<db_res.length;i++){
        var row = db_res[i];
        all_assets[row.assetId].asset_details = row;
        completed_assets.push(row.assetId);
      }
      var remaining_assets = all_asset_ids.filter((element) => !completed_assets.includes(element));
      for(var i=0;i<remaining_assets.length;i++){
        var indexer_result = await indexer.lookupAssetByID(remaining_assets[i]).do();
        if(indexer_result.asset){
          const row = {
            assetId : indexer_result.asset.index,
            creator: indexer_result.asset.params.creator,
            assetName:indexer_result.asset.params.name,
            unitName: indexer_result.asset.params['unit-name'],
            total : indexer_result.asset.params.total,
            decimals : indexer_result.asset.params.decimals,
            defaultFrozen: indexer_result.asset.params['default-frozen'],
            url : indexer_result.asset.params.url
          }
          const assetDetail = await prisma.assetDetails.create({
            data : row
          });
          if(assetDetail){
            all_assets[row.assetId].asset_details = row;
          }else{
            continue;
          }
        }else{
          continue;
        }
      }
      for(const key in all_assets){
        if(all_assets[key].asset_details.url===null){
          var balance = all_assets[key].amount/(10**all_assets[key].asset_details.decimals);
          var isCreated = (wallet.public_address==all_assets[key].asset_details.creator)?true:false;
          assets[0].assets.push({...all_assets[key],balance: balance,isCreated:isCreated});
        }else{
          const ipfs_gateway = "https://ipfs.algonode.xyz/ipfs/";
          var metadata_res = await fetch(ipfs_gateway+all_assets[key].asset_details.url.split("://")[1]);
          var metadata = await metadata_res.json();
          var balance = all_assets[key].amount/(10**all_assets[key].asset_details.decimals);
          var isCreated = (wallet.public_address==all_assets[key].asset_details.creator)?true:false;
          var isFractional = (all_assets[key].asset_details.decimals>0)?true:false;
          var image_url = ipfs_gateway+metadata.image.split("://")[1];
          assets[1].assets.push({...all_assets[key],balance: balance,isCreated:isCreated,metadata,isFractional,image_url});
        }
      }
      return {status:true,assets}
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};

export const MintNFTArweave = async () => {
  const file_path = "./moon.jpg";
  const mime = require("mime-types");
  const fs = require("fs").promises;
  const data = await fs.readFile(file_path, "utf8"); //nodejs specific
  const mimeType = mime.lookup(file_path);

  const response = await fetch("https://api.akord.com/files", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Api-Key": "yM6VEq8I8Q7JiD2nkANZ19AgKN5o6PN3aUDNvJ1Q",
      "Content-Type": mimeType,
    },
    body: data,
  });
};
