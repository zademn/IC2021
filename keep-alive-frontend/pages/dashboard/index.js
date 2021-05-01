import Header from "../../components/header";
import ModalNewApp from "../../components/modalNewApp.js";
import { Box, Button, Text, Center } from "@chakra-ui/react";
import Link from "next/link";
import { Context } from "../../context";
import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { StackDivider, VStack } from "@chakra-ui/react";
import { Select, ButtonGroup } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuIcon,
  MenuCommand,
  MenuDivider,
} from "@chakra-ui/react";

function getExpiryDateToken(token) {
  // Split token at .
  // get the third base64 stuff, which has the expiry time
  // atos - convert from base 64
  // parse into json
  // get the exp time
  try {
    return JSON.parse(atob(token.split(".")[1])).exp;
  } catch (error) {
    return -1;
  }
}

function getUserEmail(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).sub;
  } catch (error) {
    return "";
  }
}

export default function Dashboard() {
  const [cookie, setCookie] = useCookies(["token"]);
  const { state, dispatch } = useContext(Context);
  const [srvTime, setSrvTime] = useState(-1);

  useEffect(() => {
    axios
      .get(`${process.env.backend}/unixtime`)
      .then((res) => setSrvTime(res.data.time))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    dispatch({
      type: "LOGGED_IN_USER",
      payload: getUserEmail(cookie.token),
    });
  }, []);

  if (
    getExpiryDateToken(cookie.token) == -1 ||
    getExpiryDateToken(cookie.token) < srvTime
  ) {
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
              Your token has expired, please log in.
            </Text>
          </Center>
        </Box>
        <Box>
          <Center>
            <Link href="/login">
              <Button
                colorScheme="teal"
                size="lg"
                fontWeight="semibold"
                width="200px"
              >
                <Text fontSize="2xl">Log in →</Text>
              </Button>
            </Link>
          </Center>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Header name="Dashboard" logout />
      <br />
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
        m="auto"
        w="80%"
      >
        <Box mt="10">
          <Text fontWeight="bold" fontSize="2xl">
            Overview for {state.user}
          </Text>
        </Box>
        <Box h="40px">
          <ButtonGroup variant="outline" spacing="6" w={["100%", "85%", "60%"]}>
            <Menu>
              <MenuButton as={Button} colorScheme="teal" size="lg">
                Choose an app
              </MenuButton>
              <MenuList>
                <MenuGroup title="HealthChecks">
                  <MenuItem>My Account</MenuItem>
                  <MenuItem>Payments </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Monitoring">
                  <MenuItem>Docs</MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Logging">
                  <MenuItem>Docs</MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>
            <ModalNewApp cookieToken={cookie.token} />
          </ButtonGroup>
        </Box>
      </VStack>
    </Box>
  );
}
