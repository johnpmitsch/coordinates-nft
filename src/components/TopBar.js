import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Badge,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  Text,
  Spacer,
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import Jazzicon from "jazzicon";
import {
  shortenedAddress,
  AVALANCHE_MAINNET_PARAMS,
  AVALANCHE_TESTNET_PARAMS,
} from "../helpers";

const TopBarContainer = ({ children }) => {
  return (
    <Stack spacing={4} direction="row" align="center" px={2}>
      <Image boxSize="8vh" objectFit="cover" src="../logo_128x128.png" />
      <Spacer />
      {children}
    </Stack>
  );
};

const TopBar = ({
  userAddress,
  coordinates,
  mintCoordinates,
  getCoordinates,
  loadingCoors,
  loadingMint,
  minted,
  limit,
  flyToCoor,
  connectWallet,
  setUserAddress,
  wallet,
}) => {
  const [chainId, setChainId] = useState("");
  const avatarRef = useRef(null);
  const AVAX_MAINNET = "0xa86a";
  const AVAX_FUJI_TESTNET = "0xa869";
  const targetChainId =
    process.env.NODE_ENV === "production" ? AVAX_MAINNET : AVAX_FUJI_TESTNET;

  const jsNumberForAddress = (address) => {
    const addr = address.slice(2, 10);
    return parseInt(addr, 16);
  };

  const generateNewIdenticon = (address, diameter = 20) => {
    const numericRepresentation = jsNumberForAddress(address);
    return Jazzicon(diameter, numericRepresentation);
  };

  useEffect(() => {
    if (wallet?.chainId) setChainId(wallet.chainId);
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    wallet.on("chainChanged", function (networkId) {
      setChainId(networkId);
      if (wallet?.selectedAddress) setUserAddress(wallet.selectedAddress);
    });
  }, [wallet]);

  useEffect(() => {
    if (avatarRef?.current?.childElementCount < 1) {
      avatarRef?.current?.appendChild(generateNewIdenticon(userAddress));
    }
  }, [userAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchToAvalanche = () => {
    const networkParams =
      process.env.NODE_ENV === "production"
        ? AVALANCHE_MAINNET_PARAMS
        : AVALANCHE_TESTNET_PARAMS;
    wallet.request({
      method: "wallet_addEthereumChain",
      params: [networkParams],
    });
  };

  if (!wallet || !wallet?.selectedAddress) {
    return (
      <TopBarContainer>
        {wallet ? (
          <Button
            bgGradient="linear(to-r, coorsGreen.500, coorsBlue.600)"
            colorScheme="coorsGreen"
            size="md"
            m={"2"}
            onClick={connectWallet}
            color
          >
            {"Connect Wallet"}
          </Button>
        ) : (
          <Text>
            Please download{" "}
            <Link href="https://metamask.io/" isExternal>
              MetaMask
            </Link>{" "}
            to use Coordinates
          </Text>
        )}
      </TopBarContainer>
    );
  }

  if (wallet && chainId !== targetChainId) {
    return (
      <TopBarContainer>
        <Button
          bgGradient="linear(to-r, coorsGreen.500, coorsBlue.600)"
          colorScheme="coorsGreen"
          size="md"
          m={"2"}
          onClick={switchToAvalanche}
          _hover={{
            bgGradient: "linear(to-r, coorsGreen.300, coorsBlue.400)",
          }}
        >
          {"Switch to Avalanche Chain"}
        </Button>
      </TopBarContainer>
    );
  }

  return (
    <TopBarContainer>
      <Button
        isLoading={loadingMint}
        bgGradient="linear(to-r, coorsGreen.500, coorsGreen.600)"
        colorScheme="coorsGreen"
        size="md"
        onClick={mintCoordinates}
      >
        Mint
      </Button>
      <Button
        isLoading={loadingCoors}
        bgGradient="linear(to-r, coorsGreen.500, coorsGreen.600)"
        colorScheme="coorsGreen"
        size="md"
        onClick={getCoordinates}
      >
        Show My Coordinates
      </Button>
      <Spacer />
      {minted && limit && (
        <>
          <Badge
            fontSize="md"
            bgGradient="linear(to-r, coorsGreen.400, coorsGreen.600)"
            px="3"
            py="1"
          >
            <Text fontSize="lg" color="white">{`#${minted} / ${limit}`}</Text>
          </Badge>
          <Spacer />
        </>
      )}

      {coordinates && coordinates.length > 0 && (
        <>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bgGradient="linear(to-r, coorsGreen.400, coorsBlue.300)"
              _hover={{
                bgGradient: "linear(to-r, coorsGreen.300, coorsBlue.200)",
              }}
            >
              <Text fontSize="md">{coordinates.length} COOR</Text>
            </MenuButton>
            <MenuList maxH="75vh" overflowY="scroll">
              {coordinates.map(({ id, lat, lng }) => (
                <MenuItem key={id} onClick={() => flyToCoor(lat, lng)}>
                  <Text
                    p={1}
                    fontWeight="extrabold"
                    fontSize="md"
                    color="black"
                  >
                    {`#${id}`}
                  </Text>
                  <Text p={1} fontSize="md" color="black">
                    {`${lat}, ${lng}`}
                  </Text>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Spacer />
        </>
      )}
      <Spacer />
      {userAddress && (
        <>
          <Box ref={avatarRef}></Box>
          <Box>
            <Text fontSize="md">{shortenedAddress(userAddress)}</Text>
          </Box>
        </>
      )}
    </TopBarContainer>
  );
};

export default TopBar;
