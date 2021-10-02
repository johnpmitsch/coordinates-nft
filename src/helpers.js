export const shortenedAddress = (address) => {
  const begin = address.substring(0, 6);
  const ending = address.substr(-4);
  return `${begin}...${ending}`;
};

export const getUserAddress = () => window?.ethereum?.selectedAddress;
