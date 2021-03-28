import { Box, Flex, Text, Image, Button } from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
export default function Header({ name = "Welcome" }) {
  return (
    <Box as="header">
      <Head>
        <title>{name}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box bgColor="teal.200" w="100%" h="4px" />
      <Link href="/" passHref>
        <Flex
          as="a"
          align="center"
          justify="space-between"
          mx="1.5"
          mt="2"
          px="1rem"
        >
          <Flex align="center" justify="space-evenly">
            <Image
              src="./logo.svg"
              alt="Keep alive logo"
              boxSize={["40px", "50px"]}
              objectFit="cover"
            />

            <Text
              as="a"
              fontSize={["2xl", "3xl"]}
              fontWeight="semibold"
              ml="5px"
            >
              KeepAlive
            </Text>
          </Flex>
          <Flex>
            <Button
              colorScheme="cyan"
              size="lg"
              fontWeight="semibold"
              width="150px"
            >
              Log in
            </Button>
          </Flex>
        </Flex>
      </Link>
    </Box>
  );
}
