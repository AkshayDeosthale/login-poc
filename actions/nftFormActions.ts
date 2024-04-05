"use server";
import * as jwt from "jsonwebtoken";
import { prisma, prismaDisconnect } from "@/script";
import * as algosdk from "algosdk";
import { cookies } from "next/headers";
import { NFTStorage, File, Blob } from "nft.storage";
import { verifyAccessToken } from "./authFormActions";
import { error } from "console";
const fs = require("fs");
const mime = require("mime-types");
const crypto = require("crypto");

async function getFileDetails(filePath: string) {
  try {
    // Read file asynchronously
    const data = await fs.promises.readFile(filePath);

    // Get filename from file path
    const filename = filePath.split("/").pop();

    // Determine mimetype of the file
    const mimetype = mime.lookup(filePath);

    // Create blob content from file data
    const blobContent = new Blob([data], { type: mimetype });

    return {
      blobContent,
      filename,
      mimetype,
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

async function calculateSHA256(blobContent: Blob): Promise<string> {
  try {
    var buffer = Buffer.from(await blobContent.arrayBuffer());
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    return hash.digest("hex");
  } catch (error: any) {
    throw error;
  }
}

const NFT_STORAGE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxRENkYTZDYzU3YjJhQmJiQTkxOWJBNjZlMmMyMzI5NkI4ZDZCMjgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMjA1NzYxODU1NywibmFtZSI6IlNhdGlzaCJ9.rbVKcvMTidS-dXpFT0oGt0maUtjmldyfnT9pg61JtMg";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

export const createNFT = async () => {
  const cookieStore = cookies().get("authid");
  const isJWTVerified = (await verifyAccessToken(cookieStore?.value)) as any;
  if (isJWTVerified?.success === true) {
    var wallet = await prisma.user.findUnique({
      where: {
        username: isJWTVerified?.data?.username,
      },
    });
    if (wallet) {
      const asset_name = "ALGO-MOON";
      const unit_name = "MOONS";
      const nft_description = "Some description";
      const image = "temp/moon.jpg";
      let total_nfts = 1;
      const properties = {
        theme: "snow",
        background: "white",
      };
      const decimals = 3; //default value for normal nft

      if (decimals > 0) {
        total_nfts = total_nfts * 10 ** decimals;
      }

      try {
        const image_details = await getFileDetails(image); // gets image details like blob,name,mimetypr
        const hash = await calculateSHA256(image_details.blobContent) //calculates hash of the blob
          .then(async (hash) => {
            return hash;
          })
          .catch((error) => {
            return { status: false, msg: "Error calculating SHA256 hash:" };
          });
        const metadataa = {
          name: asset_name,
          description: nft_description,
          image: new File(
            [image_details.blobContent],
            image_details.filename!,
            {
              type: image_details.mimetype,
            }
          ),
          image_integrity: `sha256-${hash}`,
          image_mimetype: image_details.mimetype,
          properties: properties,
        };
        const metadata = await client.store(metadataa); // uploading files to ipfs
        if (metadata.url) {
          const algod_client = new algosdk.Algodv2(
            "",
            process.env.ALGOD_URL!,
            process.env.ALGOD_PORT
          );
          const suggestedParams = await algod_client
            .getTransactionParams()
            .do();
          const assetUrl = metadata.url + "#arc3";
          const nft_txn =
            algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
              from: wallet.public_address,
              suggestedParams,
              defaultFrozen: false,
              unitName: unit_name,
              assetName: asset_name,
              manager: wallet.public_address,
              reserve: wallet.public_address,
              freeze: wallet.public_address,
              clawback: wallet.public_address,
              assetURL: assetUrl,
              total: total_nfts,
              decimals: decimals,
            });
          const signed_nft_txn = nft_txn.signTxn(
            algosdk.mnemonicToSecretKey(wallet.private_key).sk
          );
          try {
            await algod_client.sendRawTransaction(signed_nft_txn).do();
            const result = await algosdk.waitForConfirmation(
              algod_client,
              nft_txn.txID().toString(),
              3
            );
            var confirmedRound = result["confirmed-round"];
            return {
              status: true,
              msg: `Transaction Successful in Round ${confirmedRound}`,
              tx_url: `https://testnet.explorer.perawallet.app/tx/${nft_txn.txID()}`,
            };
          } catch (e: any) {
            return { status: false, msg: e.message };
          }
        } else {
          return { status: false, msg: "Failed to Upload Files to IPFS" };
        }
      } catch (error) {
        return { status: false, msg: "Error Occured while reading file" };
      }
    } else {
      return { status: false, msg: "unable to find wallet" };
    }
  } else {
    return { status: false, msg: "Cannot Access this method without Login" };
  }
};
