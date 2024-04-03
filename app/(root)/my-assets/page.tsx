import { AssetType, getCreatedAssets } from "@/actions/authFormActions";
import { getUserDetails } from "@/actions/globalActions";
import AccountDetails from "@/components/AccountDetails";
import { UserData } from "@/components/Header";
import MyAssetList from "@/components/MyAssetList";

async function getdata() {
  const data: UserData = await getUserDetails();
  return data;
}

async function getAssetdata() {
  const assetList: AssetType = await getCreatedAssets();
  return assetList;
}

const MyAssets = async () => {
  const data = await getdata();
  const assetList: AssetType = await getAssetdata();

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
              <AccountDetails data={data} />
            </div>

            <MyAssetList holdinAssetsList={data.assets} assetList={assetList} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAssets;
