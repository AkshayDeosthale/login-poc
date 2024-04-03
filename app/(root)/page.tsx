import { createToken } from "@/actions/authFormActions";
import { getUserDetails } from "@/actions/globalActions";
import AccountDetails from "@/components/AccountDetails";
import { UserData } from "@/components/Header";

// async function getdata() {
//   const data: UserData = await getUserDetails();
//   return data;
// }

const RootPage = async () => {
  //  const data = await getdata();
  return (
    <section className=" max-w-5xl mx-auto ">
      <form action={createToken} className="py-16">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a fungible token
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Fungible tokens are digital assets that are identical and
              interchangeable, much like identical coins or banknotes. Each
              token holds the same value and can be exchanged on a one-to-one
              basis without distinction between individual units. They're
              commonly used in blockchain applications like cryptocurrencies,
              where uniformity is key for seamless transactions.
            </p>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full ">
                <AccountDetails />
              </div>
              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
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
            Create Token
          </button>
        </div>
      </form>
    </section>
  );
};

export default RootPage;
