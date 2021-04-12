import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from "@chakra-ui/react"

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react"
import { Input } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"
import { useDisclosure } from "@chakra-ui/react"
import { Select } from "@chakra-ui/react"
import {useRef} from 'react'

export default function ModalNewApp() {
    const { isOpen, onOpen, onClose } = useDisclosure()
  
    const initialRef = useRef()
  
    return (
      <>
        <Button onClick={onOpen}>New App</Button>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add new application</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Name </FormLabel>
                <Input ref={initialRef} placeholder="Name" />
              </FormControl>
  
              <FormControl mt={4}>
                <FormLabel></FormLabel>
                <Input placeholder="App Type" />
              </FormControl>
              <Select placeholder="Select option" mt={4}>
                <option value="option1">Health Check</option>
                <option value="option2">Monitoring</option>
                <option value="option3">Logging</option>
              </Select>
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
    )
  }