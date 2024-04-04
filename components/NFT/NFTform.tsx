"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoMdPhotos } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
import { RiNftLine } from "react-icons/ri";
import { useToast } from "../ui/use-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { Spinner } from "../Spinner";
import NFTproperties from "./NFTproperties";

type Inputs = {
  asset_name: string;
  unit_name: string;
  total_tokens: number;
  decimals: number;
};

const NFTform = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [checked, setChecked] = React.useState(false);
  const [imageFile, setImageFile] = useState<File>();
  const [listItems, setListItems] = useState<{ key: string; value: string }[]>(
    []
  );
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  //other
  const [imagePreview, setImagePreview] = useState<any>(null);
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //submit
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log({ imageFile, listItems });

    //  const state = await sendAsset(
    //    data.reciever,
    //    Number(data.asset_id),
    //    Number(data.amt)
    //  );
    //  if (state) {
    //    if (state.status) {
    //      toast({
    //        variant: "default",
    //        title: state.msg,
    //        action: (
    //          <ToastAction altText="Visitxn">
    //            <a target="_blank" href={state.tx_url!}>
    //              Check
    //            </a>
    //          </ToastAction>
    //        ),
    //      });
    //      router.refresh();
    //    } else {
    //      toast({
    //        variant: "destructive",
    //        title: state.msg,
    //        description: state.tx_url,
    //      });
    //    }
    //  }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" space-y-3 mt-6">
      <div className="col-span-full">
        <label
          htmlFor="cover-photo"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Upload Asset
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          {imagePreview ? (
            <div className="text-center w-full ">
              <div className="relative h-[430px] ">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-4">
                  <IoCloseCircle
                    className="text-red-500 size-6 cursor-pointer"
                    onClick={() => setImagePreview(null)}
                  />
                </div>
                <Image
                  fill
                  objectPosition="center"
                  objectFit="contain"
                  src={imagePreview}
                  alt="Uploaded Asset"
                  className="mx-auto object-cover rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <IoMdPhotos
                className="mx-auto h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="nft-image"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2  focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="nft-image"
                    name="nft-image"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
        <div className="relative my-4" data-twe-input-wrapper-init="">
          <input
            type="checkbox"
            id="canTransact"
            name="canTransact"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label className="ml-3" htmlFor="canTransact">
            Is the NFT fractional?
          </label>
        </div>
      </div>
      <div className="  pb-6">
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Asset Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                {...register("asset_name")}
                maxLength={32}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Unit name
            </label>
            <div className="mt-2">
              <input
                maxLength={8}
                type="text"
                {...register("unit_name")}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Total tokens
            </label>
            <div className="mt-2">
              <input
                type="text"
                {...register("total_tokens")}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Decimals ( Only enabled when NFT is fractional )
            </label>
            <div className="mt-2">
              <input
                disabled={checked ? false : true}
                type="text"
                {...register("decimals")}
                className={` ${
                  !checked && "cursor-not-allowed bg-gray-200"
                } block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6`}
              />
            </div>
          </div>
        </div>

        {/* properties */}
        <div className=" mt-6 col-span-full">
          <NFTproperties listItems={listItems} setListItems={setListItems} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-3 "
        >
          {isSubmitting ? (
            <Spinner className="text-white" size="medium" />
          ) : (
            <>
              <RiNftLine /> Mint the NFT
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NFTform;
