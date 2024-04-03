import { AssetType, getCreatedAssets } from "@/actions/authFormActions";
import React from "react";

type Props = {};

async function getdata() {
  const assetList: AssetType = await getCreatedAssets();
  return assetList;
}

const TransferTokenForm = async (props: Props) => {
  const assetList: AssetType = await getdata();
  return (
    <>
      <div className="col-span-full ">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Receiver's address
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset  ">
            <input
              type="text"
              name="reciever"
              id="reciever"
              className="block flex-1 px-3  border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Asset
        </label>
        <div className="mt-2">
          <select
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
            name="unit_name"
            id="unit_name"
          >
            {assetList?.assets?.map((asset, key) => (
              <option key={key} value={asset.id}>
                {asset.name} / {asset.unit_name} / {asset.balance}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Amount
        </label>
        <div className="mt-2">
          <input
            required
            min={0}
            type="number"
            name="amt"
            id="amt"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>
    </>
  );
};

export default TransferTokenForm;
