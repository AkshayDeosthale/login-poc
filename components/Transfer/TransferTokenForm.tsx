"use client";
import { AssetType, sendAsset } from "@/actions/authFormActions";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { ToastAction } from "../ui/toast";
import { useToast } from "../ui/use-toast";
import { Spinner } from "../Spinner";
import { useState } from "react";

type Props = { assetList: AssetType };

type Inputs = {
  reciever: string;
  amt: number;
  asset_id: number;
};

const TransferTokenForm = ({ assetList }: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const foundAsset = assetList?.assets?.find(
      (asset) => asset.id == data.asset_id
    );

    if (foundAsset) {
      var decimalPart = data.amt.toString().split(".")[1];
      const decimalLength = decimalPart?.length || 0;

      if (foundAsset.decimals !== decimalLength) {
        setError("amt", {
          type: "manual",
          message: `Incorrect Decimal Value , require ${foundAsset.decimals}`,
        });
        return;
      }
    }
    const state = await sendAsset(
      data.reciever,
      Number(data.asset_id),
      Number(data.amt)
    );
    if (state) {
      if (state.status) {
        toast({
          variant: "default",
          title: state.msg,

          action: (
            <ToastAction altText="Visitxn">
              <a target="_blank" href={state.tx_url!}>
                Check
              </a>
            </ToastAction>
          ),
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: state.msg,
          description: state.tx_url,
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" w-full mt-4 gap-3 grid grid-cols-2"
    >
      <div className="col-span-full ">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Receiver's address
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset  ">
            <input
              type="text"
              {...register("reciever")}
              className="block flex-1 px-3  border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Asset
        </label>
        <div className="mt-2">
          <select
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
            {...register("asset_id")}
          >
            {assetList?.assets?.map((asset, key) => (
              <option key={key} value={asset.id}>
                {asset.name} / {asset.unit_name} / {asset.balance}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Amount
        </label>
        <div className="mt-2">
          <input
            type="string"
            {...register("amt")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
          {errors.amt && (
            <p className="mt-2 text-red-400">* {errors.amt.message}</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md w-[200px] flex justify-center items-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm  gap-3 "
        >
          {isSubmitting ? (
            <Spinner className="text-white" size="medium" />
          ) : (
            "Send Asset"
          )}
        </button>
      </div>
    </form>
  );
};

export default TransferTokenForm;
