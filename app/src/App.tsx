import "./App.css";
import { TodoLayout } from "./components/TodoLayout";
import "@solana/wallet-adapter-react-ui/styles.css";

import { useState } from "react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import useConnectWallet from "./hooks/useConnectWallet";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";

function App() {
  const [profile, setProfile] = useState(false);
  const { initializeUser,userInitiated } = useConnectWallet().hooks;

  const { publicKey } = useWallet();

  const btnHandle = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    console.log(publicKey);
    if(publicKey == null){
      console.log("Connect Your Wallet")
      toast("Please Connect your Wallet Aniki!!", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      return
    }
    try {
      console.log("Initializing started.......");
      const respone = initializeUser().then((res) =>
        res ? setProfile(res) : setProfile(res)
      );
      toast.promise(
        respone,
        {
          pending: "Initiating your Profile",
          success: "Profile is fetched",
          error: "Error Occured While Creating/Fetching your Profile",
        },
        {
          position: "bottom-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }
      );
    } catch (error) {
      console.log(`${error}`);
    }
  };

  return (
    <>
      <Box>
      <ToastContainer />
        <Flex p={"8"} justify={"between"} align={"center"}>
          <Button
            onClick={(e) => btnHandle(e)}
            radius="small"
            color="tomato"
            size={"4"}
          >
            Initiate User
          </Button>
          <WalletMultiButton />
        </Flex>
        {userInitiated ? (
          <div>
            <div className=" text-white p-5 min-h-max flex justify-center ">
              <TodoLayout />
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center pb-44">
            <Text size={"6"}>Initiate Your Todo Profile Dattebayo!!!</Text>
          </div>
        )}
      </Box>
    </>
  );
}

export default App;

// -  React does is keep our UI in sync with our application state. The tool that it uses to do this is called a “re-render”.
// 1) The WalletAdaterNetwork is enum of main-net,dev-net and local-net
// 2) This clusterAPIUrl returns 'https://api.devnet.solana.com'
