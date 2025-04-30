import { Box, Heading } from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";

export default function NotActive({ children }: { children: React.ReactNode }) {
  return (
    <Box position="relative">
      <Box
        pos={"absolute"}
        top={0}
        left={0}
        w={"100%"}
        h={"100%"}
        bg={"color(srgb 0 0 0 / 0.83)"}
        borderRadius="xl"
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign={"center"}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDir={"column"}
          gap={2}
        >
          <FiLock color={'white'} size={"2rem"} />
          <Heading color={'white'} size={"lg"}>Coming Soon</Heading>
        </Box>
      </Box>
      <Box filter="blur(2px)">{children}</Box>
    </Box>
  );
}
