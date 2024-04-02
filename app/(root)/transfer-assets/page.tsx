"use client";
import {
  AssetType,
  getCreatedAssets,
  sendAsset,
} from "@/actions/authFormActions";
import { getUserDetails } from "@/actions/globalActions";
import { UserData } from "@/components/Header";
import React from "react";

const AssetTransferPage = async () => {
  const data: UserData = await getUserDetails();
  const assetList: AssetType = await getCreatedAssets();

  return (
    <section className=" max-w-5xl mx-auto ">
      <form action={sendAsset} className="py-16">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Transfer your tokens
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              You can transfer the tokens you own
            </p>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full ">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Acount Details
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset  ">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      {data.username} /
                    </span>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="block flex-1 px-3 cursor-not-allowed border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="janesmith"
                      value={data.address}
                      disabled
                    />
                    <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                      / Algo Balance : {data.balance}
                    </span>
                  </div>
                </div>
              </div>
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
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          {/* <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button> */}
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-3 "
          >
            Send Asset
          </button>
        </div>
      </form>
    </section>
  );
};

export default AssetTransferPage;
