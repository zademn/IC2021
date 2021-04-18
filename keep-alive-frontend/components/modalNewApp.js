import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  Select,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Slider,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";

export default function ModalNewApp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appType, setAppType] = useState("");
  const [period, setPeriod] = useState(5);
  const [gracePeriod, setGracePeriod] = useState(5);

  const changeAppType = (event) => {
    setAppType(event.target.value);
  };

  return (
    <>
      <Button width="40%" onClick={onOpen} size="lg">
        New App
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add new application</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name </FormLabel>
              <Input placeholder="Name" />
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
              </FormControl>
            ) : null}
            {appType == "Monitoring" ? (
              <FormControl mt={4}>
                <FormLabel>Monitoring </FormLabel>
                <Input placeholder="mm" />
              </FormControl>
            ) : null}
            {appType == "Logging" ? (
              <FormControl mt={4}>
                <FormLabel>Logging </FormLabel>
                <Input placeholder="LL" />
              </FormControl>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
