"use client";
import { AssetType, getCreatedAssets } from "@/actions/authFormActions";
import { getUserDetails } from "@/actions/globalActions";
import { UserData } from "@/components/Header";
import React from "react";

const MyAssets = async () => {
  const data: UserData = await getUserDetails();
  const assetList: AssetType = await getCreatedAssets();
  return (
    <section className=" max-w-5xl mx-auto ">
      <div className="space-y-12 py-16">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            My Tokens
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            This is the list of tokens you created and own
          </p>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-4 gap-x-6 gap-y-8 ">
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
            <div className="col-span-full ">Created</div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, key) => (
              <div
                key={key}
                className="cursor-default border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
              >
                <div className="">
                  <p className="font-bold">Asset123</p>
                  <p className="text-sm">ETH</p>
                  <p className="text-sm">200.443 ETH</p>
                </div>
              </div>
            ))}

            <div className="col-span-full ">All Assets</div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, key) => (
              <div
                key={key}
                className="cursor-default border border-slate-300 p-6 rounded-lg hover:border-slate-600 active:border-slate-600 focus:border-slate-600 transition-all duration-200 ease-in-out "
              >
                <div className="">
                  <p className="font-bold">Asset123</p>
                  <p className="text-sm">ETH</p>
                  <p className="text-sm">200.443 ETH</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAssets;
