import Header from "../../components/header";
import DataTable from "../../components/DataTable";
import ModalNewApp from "../../components/modalNewApp.js";
//import PlotMon from "../../components/plot.js";
import { Box, Button, Text, Center, AlertDialog } from "@chakra-ui/react";
import Link from "next/link";
import { Context } from "../../context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { StackDivider, VStack } from "@chakra-ui/react";
import { ButtonGroup } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
} from "@chakra-ui/react";
import useSWR, { mutate } from "swr";
import PlotMon from "../../components/plot";
import AlertDelete from "../../components/AlertDelete";

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

const fetcher = (url, token) =>
  axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => res.data);

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

  const [fetchApps, setFetchApps] = useState(true);

  // -------------------------------------------- get healthchecks
  const [hcApps, setHcApps] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.backend}/apps-hc`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => setHcApps(res.data))
      .catch((err) => {});
  }, [fetchApps]);

  // keep track of the current selected app
  const [currentSelectedApp, setCurrentSelectedApp] = useState(null);

  // statuses for the selected app
  const [hcAppsStatuses, setHcAppsStatuses] = useState(null);
  // when you get the result, set the mon and log apps to null
  // basically removes the render
  function getHealthCheckStatuses(app_id) {
    axios
      .get(`${process.env.backend}/apps-hc-status/${app_id}`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => {
        setLogAppsStatuses(null);
        setAppIdMon(null);
        setHcAppsStatuses(res.data);
      })
      .catch((err) => {});
  }

  // -------------------------------------------- get monitoring

  const [monApps, setMonApps] = useState(null);
  const [appIdMon, setAppIdMon] = useState(null);

  // Get Monitoring apps
  useEffect(() => {
    axios
      .get(`${process.env.backend}/apps-mon`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => {
        setHcAppsStatuses(null);
        setLogAppsStatuses(null);
        setMonApps(res.data);
      })
      .catch((err) => {});
  }, [fetchApps]);

  // Get monitoring app data
  function getMonStatuses(app_id) {
    setHcAppsStatuses(null);
    setLogAppsStatuses(null);
    setAppIdMon(app_id);
  }
  const { data: monAppsStatuses, error } = useSWR(
    appIdMon
      ? [`${process.env.backend}/app-mon-status/${appIdMon}`, cookie.token]
      : null,
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  // -------------------------------------------- get logging

  const [logApps, setLogApps] = useState(null);
  useEffect(() => {
    axios
      .get(`${process.env.backend}/apps-log`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => setLogApps(res.data))
      .catch((err) => {});
  }, [fetchApps]);
  const [logAppsStatuses, setLogAppsStatuses] = useState(null);
  function getLogStatuses(app_id) {
    axios
      .get(`${process.env.backend}/app-logging/${app_id}`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => {
        setHcAppsStatuses(null);
        setAppIdMon(null);
        setLogAppsStatuses(res.data);
      })
      .catch((err) => {});
  }

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
              <MenuButton
                as={Button}
                colorScheme="teal"
                size="lg"
                onClick={() => setFetchApps(!fetchApps)}
              >
                Choose an app
              </MenuButton>
              <MenuList>
                <MenuGroup title="HealthChecks">
                  {hcApps
                    ? hcApps.map((hcApp) => {
                        return (
                          <MenuItem
                            onClick={() => {
                              getHealthCheckStatuses(hcApp.uuid);
                              setCurrentSelectedApp({
                                app_type: "HealthCheck",
                                name: hcApp.name,
                                id: hcApp.uuid,
                              });
                            }}
                          >
                            {hcApp.name}
                          </MenuItem>
                        );
                      })
                    : ""}
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Monitoring">
                  {monApps !== null &&
                  JSON.stringify(monApps) !== JSON.stringify({})
                    ? monApps.map((monApp) => {
                        return (
                          <MenuItem
                            onClick={() => {
                              getMonStatuses(monApp.uuid);
                              setCurrentSelectedApp({
                                app_type: "Monitoring",
                                name: monApp.name,
                                id: monApp.uuid,
                              });
                            }}
                          >
                            {monApp.name}
                          </MenuItem>
                        );
                      })
                    : ""}
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Logging">
                  {logApps
                    ? logApps.map((logApp) => {
                        return (
                          <MenuItem
                            onClick={() => {
                              getLogStatuses(logApp.uuid);
                              setCurrentSelectedApp({
                                app_type: "Logging",
                                name: logApp.name,
                                id: logApp.uuid,
                              });
                            }}
                          >
                            {logApp.name}
                          </MenuItem>
                        );
                      })
                    : ""}
                </MenuGroup>
              </MenuList>
            </Menu>
            <ModalNewApp cookieToken={cookie.token} />
          </ButtonGroup>
        </Box>
        {currentSelectedApp === null ? null : (
          <Box mt="10">
            <Text fontWeight="bold" fontSize="xl">
              {currentSelectedApp?.name}
              <Box as="span" ml={2}>
                {currentSelectedApp?.id && (
                  <AlertDelete
                    app_id={currentSelectedApp.id}
                    setCurrentSelectedApp={setCurrentSelectedApp}
                  />
                )}
              </Box>
            </Text>
            <Text fontWeight="bold" fontSize="xl" bg="blue.800" mt={2}>
              {currentSelectedApp.app_type === "HealthCheck" &&
                `${process.env.backend}/app/${currentSelectedApp?.id}`}
              {currentSelectedApp.app_type === "Logging" &&
                `${process.env.backend}/app-logging-status/${currentSelectedApp?.id}`}
              {currentSelectedApp.app_type === "Monitoring" &&
                `${process.env.backend}/app-mon-status/${currentSelectedApp?.id}`}
            </Text>
            {currentSelectedApp.app_type === "Logging" && (
              <code>{`Make a post request with this body to the link
              {
                device_id: "string",
                severity_level: int,
                message: "string"
              }
              `}</code>
            )}
            {currentSelectedApp.app_type === "Monitoring" && (
              <code>{`Make a continous post request with this body to the link
              {"cpu": cpu, 'memory': memory}
              `}</code>
            )}
          </Box>
        )}

        {hcAppsStatuses !== null ? (
          <Box mt="10">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Next check for </Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {hcAppsStatuses.map((hcStatus, index) => {
                  const length = hcAppsStatuses.length;
                  return (
                    <Tr>
                      <Td>{index + 1}</Td>
                      <Td>{hcStatus.next_receive}</Td>
                      <Td>
                        {hcStatus.done === false ? (
                          index === length - 1 ? (
                            <Badge colorScheme="orange">Waiting</Badge>
                          ) : (
                            <Badge colorScheme="red">Failed</Badge>
                          )
                        ) : (
                          <Badge colorScheme="green">Received</Badge>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th>ID</Th>
                  <Th>Next check</Th>
                  <Th>Status</Th>
                </Tr>
              </Tfoot>
            </Table>
          </Box>
        ) : null}

        {logAppsStatuses ? (
          <DataTable
            received={logAppsStatuses.map((status) => {
              return {
                timestamp: status.timestamp,
                deviceID: status.device_id,
                severityLevel: status.severity_level,
                message: status.message,
              };
            })}
          />
        ) : null}
        {/* {error ? <div>failed to load</div> : null}
        {!monAppsStatuses ? <div>Loading...</div> : null} */}
        {monAppsStatuses ? (
          <div>
            <PlotMon data={monAppsStatuses} />
          </div>
        ) : null}
      </VStack>
    </Box>
  );
}
