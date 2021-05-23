import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Slider,
  Box,
  Flex,
  Code,
} from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useClipboard } from "@chakra-ui/react";
import axios from "axios";

export default function ModalNewApp({ cookieToken }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appType, setAppType] = useState("");
  const [appName, setAppName] = useState("My Application");
  const [period, setPeriod] = useState(5);
  const [loggingThreshold, setLoggingThreshold] = useState(0);
  const periodInHours = {
    hours: Math.floor(period / 60),
    minutes: period % 60,
  };
  const [gracePeriod, setGracePeriod] = useState(5);
  const [appURLvalue, setValue] = useState(
    `${process.env.backend}/app/${uuidv4()}`
  );

  const { hasCopied, onCopy } = useClipboard(appURLvalue);

  const [appCreateStatus, setAppCreateStatus] = useState("blue");

  const changeAppType = (event) => {
    setAppType(event.target.value);
  };
  const changeThreshold = (val) => {
    setLoggingThreshold(val);
  };
  const changeAppName = (event) => {
    setAppName(event.target.value);
  };
  const handleAppCreation = () => {
    if (appType === "Health Check") {
      let healthCheckConfig = {
        app_name: appName,
        period: period,
        grace: gracePeriod,
      };
      axios
        .post(appURLvalue, healthCheckConfig, {
          headers: {
            Authorization: cookieToken,
          },
        })
        .then((res) => {
          setAppCreateStatus("green");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        })
        .catch((err) => {
          setAppCreateStatus("red");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        });
    } else if (appType === "Logging") {
      let loggerConfig = {
        app_name: appName,
        severity_threshold: loggingThreshold,
      };
      axios
        .post(appURLvalue.replace("app", "app-logging"), loggerConfig, {
          headers: {
            Authorization: cookieToken,
          },
        })
        .then((res) => {
          setAppCreateStatus("green");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        })
        .catch((err) => {
          setAppCreateStatus("red");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        });
    } else if (appType === "Monitoring") {
      let monitoringConfig = {
        app_name: appName,
      };
      console.log(appName, appURLvalue.replace("app", "app-mon"));
      axios
        .post(appURLvalue.replace("app", "app-mon"), monitoringConfig, {
          headers: {
            Authorization: cookieToken,
          },
        })
        .then((res) => {
          setAppCreateStatus("green");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        })
        .catch((err) => {
          setAppCreateStatus("red");
          setTimeout(() => {
            setAppCreateStatus("blue");
          }, 1000);
        });
    }
  };

  useEffect(() => {
    setValue(`${process.env.backend}/app/${uuidv4()}`);
    setAppType("");
  }, [isOpen]);

  return (
    <>
      <Button width="60%" onClick={onOpen} size="lg">
        New App
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add new application</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name </FormLabel>
              <Input placeholder={appName} onChange={changeAppName} />
            </FormControl>

            <Select
              placeholder="Select application type"
              mt={4}
              onChange={changeAppType}
            >
              <option value="Health Check">Health Check</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Logging">Logging</option>
            </Select>

            {appType == "Health Check" ? (
              <FormControl mt={4}>
                <FormLabel>
                  Period (expected time between pings)
                  <br />
                  <strong>{period}</strong> minutes.
                </FormLabel>
                <Slider
                  defaultValue={60}
                  min={5}
                  max={300}
                  step={5}
                  onChange={(val) => setPeriod(val)}
                >
                  <SliderTrack bg="green.100">
                    <Box position="relative" right={10} />
                    <SliderFilledTrack bg="green" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <FormLabel>
                  Grace (When a check is late, how long to wait until an alert
                  is sent. )<br /> <strong>{gracePeriod}</strong> minutes.
                </FormLabel>
                <Slider
                  defaultValue={60}
                  min={5}
                  max={300}
                  step={5}
                  onChange={(val) => setGracePeriod(val)}
                >
                  <SliderTrack bg="red.100">
                    <Box position="relative" right={10} />
                    <SliderFilledTrack bg="tomato" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <FormLabel>
                  Keep this check up by making HTTP requests to this url:
                </FormLabel>
                <Flex mb={2}>
                  <Input value={appURLvalue} isReadOnly placeholder="Welcome" />
                  <Button onClick={onCopy} ml={2}>
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </Flex>
                <FormLabel>Usage examples:</FormLabel>
                <Tabs isFitted variant="enclosed" size="md">
                  <TabList mb="1em">
                    <Tab>Cron</Tab>
                    <Tab>Bash</Tab>
                    <Tab>Python</Tab>
                    <Tab>Node.js</Tab>
                    <Tab>Go</Tab>
                    <Tab>C#</Tab>
                    <Tab>Browser</Tab>
                    <Tab>PowerShell</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {periodInHours.hours === 0
                          ? `*/${periodInHours.minutes} * * * * /your/command.sh && curl -fsS -m 10 --retry 5 -o /dev/null ${appURLvalue}`
                          : periodInHours.hours !== 0 &&
                            periodInHours.minutes === 0
                          ? `* */${periodInHours.hours} * * * /your/command.sh && curl -fsS -m 10 --retry 5 -o /dev/null ${appURLvalue}`
                          : `*/${periodInHours.minutes} */${periodInHours.hours} * * * /your/command.sh && curl -fsS -m 10 --retry 5 -o /dev/null ${appURLvalue}`}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
# using curl (10 second timeout, retry up to 5 times):{" "}
curl -m 10 --retry 5 ${appURLvalue} 

# using wget (10 second timeout, retry up to 5 times): 
wget ${appURLvalue} -T 10 -t 5 -O /dev/null
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
# Using Python 3 standard library:
import socket
import urllib.request

try:
    urllib.request.urlopen(
      "${appURLvalue}", 
      timeout=10)
except socket.error as e:
    # Log ping failure here...
    print("Ping failed: %s" % e)
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
var https = require('https');
https.get('${appURLvalue}')
      .on('error', (err) => {
          console.log('Ping failed: ' + err)
});
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
package main
import "fmt"
import "net/http"
import "time"
func main() {
    var client = &http.Client{
        Timeout: 10 * time.Second,
    }
    _, err := client.Head("${appURLvalue}")
    if err != nil {
        fmt.Printf("%s", err)
    }
}
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
using (var client = new System.Net.WebClient())
{
    client.DownloadString("${appURLvalue}");
}
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
var xhr = new XMLHttpRequest();
xhr.open('GET', '${appURLvalue}', true);
xhr.send(null);
                        `}
                      </pre>
                    </TabPanel>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
Invoke-RestMethod ${appURLvalue}
                        `}
                      </pre>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </FormControl>
            ) : null}
            {appType == "Monitoring" ? (
              <FormControl mt={4}>
                <FormLabel>
                  Keep this check up by making POST requests to this url:
                </FormLabel>
                <Flex mb={2}>
                  <Input
                    value={appURLvalue.replace("app", "app-monitoring")}
                    isReadOnly
                    placeholder="Welcome"
                  />
                  <Button onClick={onCopy} ml={2}>
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </Flex>
                <FormLabel mt={4}>
                  This monitoring app keeps track of different resources
                </FormLabel>
                <Tabs isFitted variant="enclosed" size="md">
                  <TabList mb="1em">
                    <Tab>Python</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {`
import psutil
import time
import requests
import json
url = "${appURLvalue.replace("app", "app-monitoring")}"
while True:
    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    print(memory)
    time.sleep(2)
    r = requests.post(url, data=json.dumps({"cpu": cpu, 'memory': memory}), headers={'accept': 'application/json',
                                                                                     'Content-Type': 'application/json'})
    print(r.json)

                        `}
                      </pre>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </FormControl>
            ) : null}
            {appType == "Logging" ? (
              <FormControl mt={4}>
                <FormLabel>
                  Keep this check up by making POST requests to this url:
                </FormLabel>
                <Flex mb={2}>
                  <Input
                    value={appURLvalue.replace("app", "app-logging")}
                    isReadOnly
                    placeholder="Welcome"
                  />
                  <Button onClick={onCopy} ml={2}>
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </Flex>
                <FormLabel mt={4}>
                  Notify me when the request goes below:
                </FormLabel>
                <NumberInput
                  defaultValue={0}
                  min={0}
                  max={10}
                  onChange={(val) => changeThreshold(val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormLabel mt={4}>Example of JSON body:</FormLabel>
                <FormLabel>
                  The device_id can be anything that identifies the device, such
                  as a name or ip
                </FormLabel>
                <FormLabel>
                  Severity is the severity level of the log, usually between 1
                  and 7
                </FormLabel>
                <FormLabel>
                  The message can be anything related to this event
                </FormLabel>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {`
curl --header "Content-Type: application/json" \
--request POST \
--data '{"device_id":"name_or_ip","severity_level":1,"message":"my custom message"}' \
${appURLvalue.replace("app", "app-logging")}
                      `}
                </pre>
              </FormControl>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme={appCreateStatus}
              mr={3}
              onClick={handleAppCreation}
            >
              {appCreateStatus === "blue" ? "Save" : null}
              {appCreateStatus === "green" ? "Done!" : null}
              {appCreateStatus === "red" ? "Error" : null}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
