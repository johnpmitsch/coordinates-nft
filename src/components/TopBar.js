import React, { useEffect, useRef } from "react";
import {
  Box,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  Text,
  Spacer,
  Image,
} from "@chakra-ui/react";
import Jazzicon from "jazzicon";
import { shortenedAddress } from "../helpers";

const TopBar = ({
  userAddress,
  coordinates,
  mintCoordinates,
  getCoordinates,
  loading,
  minted,
  limit,
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
      {minted && limit && (
        <>
          <Box>
            <Text fontSize="lg" alt="minted">{`${minted} / ${limit}`}</Text>
          </Box>
          <Spacer />
        </>
      )}
      <Button colorScheme="coorsGreen" size="md" onClick={mintCoordinates}>
        Mint
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
      {coordinates && coordinates.length > 0 && (
        <>
          <Menu>
            <MenuButton>
              <Text fontSize="md">{coordinates.length} COOR</Text>
            </MenuButton>
            <MenuList>
              {coordinates.map(({ id, lat, lng }) => (
                <MenuItem key={id}>{id}</MenuItem>
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
