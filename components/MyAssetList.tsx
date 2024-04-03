import { AssetType, getCreatedAssets } from "@/actions/authFormActions";
import React from "react";

type Props = {};

async function getdata() {
  const assetList: AssetType = await getCreatedAssets();
  return assetList;
}

const MyAssetList = async (props: Props) => {
  const assetList: AssetType = await getdata();

  return (
    <>
      <div className="col-span-full ">Created</div>
      <div className="col-span-full grid grid-cols-3 gap-3 ">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, key) => (
          <div
            key={key}
            className="cursor-default  border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
          >
            <div className="">
              <p className="font-bold">Asset123</p>
              <p className="text-sm">ETH</p>
              <p className="text-sm">200.443 ETH</p>
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-full ">All Assets</div>
      <div className="col-span-full grid grid-cols-3 gap-3 ">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, key) => (
          <div
            key={key}
            className="cursor-default  border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
          >
            <div className="">
              <p className="font-bold">Asset123</p>
              <p className="text-sm">ETH</p>
              <p className="text-sm">200.443 ETH</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyAssetList;
