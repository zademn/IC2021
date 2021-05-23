import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
export default function AlertDelete({ app_id, setCurrentSelectedApp }) {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  const [cookie, setCookie] = useCookies(["token"]);

  function deleteApp() {
    axios
      .delete(`${process.env.backend}/app-delete/${app_id}`, {
        headers: {
          Authorization: cookie.token,
        },
      })
      .then((res) => {
        setIsOpen(false);
        setCurrentSelectedApp(null);
      })
      .catch((err) => {});
  }

  return (
    <>
      <Button colorScheme="red" onClick={() => setIsOpen(true)} size="sm">
        Delete Application
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Application
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={deleteApp} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
