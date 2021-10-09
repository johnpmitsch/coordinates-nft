import React, { useEffect, useRef } from "react";
import {
  Box,
  Badge,
  Button,
  Center,
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
import { shortenedAddress } from "../helpers";

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
  chainId,
  wallet,
  connectWallet,
}) => {
  const avatarRef = useRef(null);

  const jsNumberForAddress = (address) => {
    const addr = address.slice(2, 10);
    return parseInt(addr, 16);
  };

  const generateNewIdenticon = (address, diameter = 20) => {
    const numericRepresentation = jsNumberForAddress(address);
    return Jazzicon(diameter, numericRepresentation);
  };

  useEffect(() => {
    if (avatarRef?.current?.childElementCount < 1) {
      avatarRef?.current?.appendChild(generateNewIdenticon(userAddress));
    }
  }, [userAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  if (window?.ethereum?.chainId !== chainId) {
    return (
      <Center>
        <Text>
          {
            "Please ensure you have MetaMask installed and connected to the Avalanche Network"
          }
        </Text>
      </Center>
    );
  }

  if (!wallet.selectedAddress) {
    return (
      <Stack spacing={4} direction="row" align="center" px={2}>
        <Image boxSize="8vh" objectFit="cover" src="../logo_128x128.png" />
        <Spacer />
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
      </Stack>
    );
  }
  return (
    <Stack spacing={4} direction="row" align="center">
      <Image boxSize="8vh" objectFit="cover" src="../logo_128x128.png" />
      <Spacer />
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
            bgGradient="linear(to-r, coorsGreen.500, coorsGreen.600)"
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
                  <Text fontWeight="extrabold" fontSize="md" color="black">
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
    </Stack>
  );
};

export default TopBar;
