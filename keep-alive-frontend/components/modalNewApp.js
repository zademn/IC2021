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
import { Select } from "@chakra-ui/react";
import { useState } from "react";

function getFields(appType) {
  switch (appType) {
    case "Health Check":
      return (
        <FormControl mt={4}>
          <FormLabel>Grace </FormLabel>
          <Input placeholder="0" />
          <FormLabel>HC </FormLabel>
          <Input placeholder="Hc" />
        </FormControl>
      );
      break;
    case "Monitoring":
      return (
        <FormControl>
          <FormLabel>Monitoring </FormLabel>
          <Input placeholder="mm" />
        </FormControl>
      );
      break;
    case "Logging":
      return (
        <FormControl>
          <FormLabel>Logging </FormLabel>
          <Input placeholder="LL" />
        </FormControl>
      );
      break;
    default:
      return null;
  }
}
export default function ModalNewApp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appType, setAppType] = useState("");

  const changeAppType = (event) => {
    setAppType(event.target.value);
  };
  console.log(appType);

  return (
    <>
      <Button onClick={onOpen}>New App</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add new application</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name </FormLabel>
              <Input placeholder="Name" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Select application type</FormLabel>
              <Input placeholder="App Type" />
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

            {appType !== "" ? getFields(appType) : null}
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
