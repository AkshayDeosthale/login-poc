"use client";
import { AssetType, sendAsset } from "@/actions/authFormActions";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { ToastAction } from "../ui/toast";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

type Props = { assetList: AssetType };

const TransferTokenForm = ({ assetList }: Props) => {
  const [state, formAction] = useFormState<any, FormData>(sendAsset, null);
  const router = useRouter();

  const { toast } = useToast();
  useEffect(() => {
    if (state) {
      if (state.status) {
        toast({
          variant: "default",
          title: state.msg,
          description: state.tx_url,
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
      <div className="">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Asset
        </label>
        <div className="mt-2">
          <select
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
            name="asset_id"
            id="asset_id"
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
            required
            min={0}
            type="number"
            name="amt"
            id="amt"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 input-style sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-3 "
        >
          Send Asset
        </button>
      </div>
    </form>
  );
};

export default TransferTokenForm;
