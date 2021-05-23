import Header from "../components/header";
import { Box, Button, Text, Center } from "@chakra-ui/react";
import Link from "next/link";
import { Context } from "../context";

import { useContext } from "react";

export default function Home() {
  const { state, dispatch } = useContext(Context);
  return (
    <Box>
      <Header name="Keep Alive" />
      <Box>
        <Center mt="10rem" mx="auto" w="75%">
          <Text
            fontSize={["3xl", "5xl", "6xl"]}
            fontWeight="extrabold"
            textAlign="center"
            w={["100%", "90%", "50%", "40%"]}
          >
            Get notified when something goes{" "}
            <Text
              fontSize={["3xl", "5xl", "6xl"]}
              fontWeight="extrabold"
              color="red.500"
            >
              wrong
            </Text>
          </Text>
        </Center>
      </Box>
      <Box>
        <Center>
          <Link href="/register">
            <Button
              colorScheme="teal"
              size="lg"
              fontWeight="semibold"
              width="200px"
            >
              <Text fontSize="2xl">Get started →</Text>
            </Button>
          </Link>
        </Center>
      </Box>
    </Box>
  );
}
