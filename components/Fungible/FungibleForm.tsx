"use client";
import { createToken } from "@/actions/authFormActions";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { useFormState, useFormStatus } from "react-dom";
import { ToastAction } from "../ui/toast";
import { useRouter } from "next/navigation";

type Props = {};

const FungibleForm = (props: Props) => {
  const [state, formAction] = useFormState<any, FormData>(createToken, null);

  const router = useRouter();

  const { toast } = useToast();
  useEffect(() => {
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
  }, [state]);

  return (
    <form action={formAction} className=" w-full mt-4 gap-3 grid grid-cols-2">
      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Asset Name
        </label>
        <div className="mt-2">
          <input
            required
            type="text"
            name="asset_name"
            id="asset_name"
            maxLength={32}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Unit name
        </label>
        <div className="mt-2">
          <input
            required
            maxLength={8}
            type="text"
            name="unit_name"
            id="unit_name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Total supply
        </label>
        <div className="mt-2">
          <input
            required
            min={0}
            type="number"
            name="total_supply"
            id="total_supply"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Decimals
        </label>
        <div className="mt-2">
          <input
            required
            min={0}
            max={19}
            type="number"
            name="decimals"
            id="decimals"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-3 "
        >
          Create Token
        </button>
      </div>
    </form>
  );
};

export default FungibleForm;
