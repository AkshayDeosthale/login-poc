import { sendAsset } from "@/actions/authFormActions";
import AccountDetails from "@/components/AccountDetails";
import TransferTokenForm from "@/components/TransferTokenForm";

const AssetTransferPage = () => {
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
                <AccountDetails />
              </div>

              <TransferTokenForm />
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
