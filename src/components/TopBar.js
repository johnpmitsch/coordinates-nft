import React, { useEffect, useRef } from "react";
import {
  Box,
  Image,
  Button,
  Stack,
  Flex,
  Center,
  Spacer,
} from "@chakra-ui/react";
import Jazzicon from "jazzicon";
import { shortenedAddress } from "../helpers";

const TopBar = ({
  userAddress,
  coordinates,
  mintCoordinates,
  getCoordinates,
  loading,
}) => {
  const avatarRef = useRef(null);

  useEffect(() => {
    if (avatarRef?.current?.childElementCount < 1) {
      avatarRef?.current?.appendChild(generateNewIdenticon(userAddress));
    }
  }, [userAddress]);

  const jsNumberForAddress = (address) => {
    const addr = address.slice(2, 10);
    return parseInt(addr, 16);
  };

  const generateNewIdenticon = (address, diameter = 20) => {
    const numericRepresentation = jsNumberForAddress(address);
    return Jazzicon(diameter, numericRepresentation);
  };

  return (
    <Stack spacing={4} direction="row" align="center">
      <Image boxSize="8vh" objectFit="cover" src="../logo_128x128.png" />
      <Spacer />
      <Button colorScheme="coorsGreen" size="md" onClick={mintCoordinates}>
        Mint Coordinates
      </Button>
      <Button
        isLoading={loading}
        colorScheme="coorsGreen"
        size="md"
        onClick={getCoordinates}
      >
        Show My Coordinates
      </Button>
      <Spacer />
      {coordinates?.length && <Box>{coordinates.length} Coordinates</Box>}
      <Spacer />j
      {userAddress && (
        <>
          <Box ref={avatarRef}></Box>
          <Box>{shortenedAddress(userAddress)}</Box>
        </>
      )}
    </Stack>
  );
};

export default TopBar;
