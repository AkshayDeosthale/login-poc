import { AssetType, getCreatedAssets } from "@/actions/authFormActions";
import React from "react";

type Props = { assetList: AssetType };

const MyAssetList = async ({ assetList }: Props) => {
  console.log("assets-------------------------->", assetList);

  return (
    <>
      <div className="col-span-full ">All Assets</div>
      <div className="col-span-full grid grid-cols-3 gap-3 ">
        {assetList?.assets?.map((asset, key) => (
          <div
            key={key}
            className="cursor-default  border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
          >
            <div className="">
              <p className="font-bold">{asset.name}</p>
              <p className="text-sm">{asset.unit_name}</p>
              <p className="text-sm">
                {asset.balance} {asset.unit_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyAssetList;
