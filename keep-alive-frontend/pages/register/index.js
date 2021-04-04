import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormHelperText,
  Text,
  CloseButton,
  Box,
  Flex,
} from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import Header from "../../components/header";
import Link from "next/link";

function DisplayAlert({ status, title, description }) {
  return (
    <Box mt="20px">
      <Alert status={status} variant="solid" borderRadius="5">
        <AlertIcon />
        <AlertTitle mr={2}>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </Box>
  );
}

export default function Register() {
  const [show1, setshow1] = useState(false);
  const handleClick1 = () => setshow1(!show1);

  const [show2, setshow2] = useState(false);
  const handleClick2 = () => setshow2(!show2);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [alert, setAlert] = useState(null);

  function handlePass(e) {
    setPassword(e.target.value);
  }

  function handleConfirmPass(e) {
    setConfirmPassword(e.target.value);
  }

  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function handleSubmit() {
    if (confirmPassword !== password) {
      setAlert(
        <DisplayAlert
          title="Password Error"
          description="Password and confirm password don't match"
          status="error"
        />
      );
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      return;
    }
    axios
      .post(`${process.env.backend}/register`, {
        email: email,
        password: password,
      })
      .then((res) =>
        setAlert(
          <DisplayAlert
            title="Register"
            description={res.data.detail}
            status="success"
          />
        )
      )
      .catch((err) => {
        setAlert(
          <DisplayAlert
            title="Error"
            description="Try a different username or password"
            status="error"
          />
        );
      });
  }

  return (
    <Box>
      <Header name="Register" />
      <Box w={["90%", "50%"]} mx="auto" mt="10%">
        <FormControl id="email" isRequired>
          <FormLabel fontSize="lg">Email address</FormLabel>
          <Input type="email" size="lg" value={email} onChange={handleEmail} />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel fontSize="lg">Password</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show1 ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={handlePass}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick1}>
                {show1 ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormHelperText>
            Password should contain uppercase, lowercase, symbols and be at
            least 8 characters long
          </FormHelperText>
        </FormControl>
        <FormControl id="confirm-password" isRequired>
          <FormLabel fontSize="lg">Confirm password</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show2 ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleConfirmPass}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick2}>
                {show2 ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Flex alignItems="center" justifyContent="space-between">
          <Button
            mt={4}
            colorScheme="teal"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <Link href="/login" passHref>
            <Button mt={4} colorScheme="teal" type="submit" variant="link">
              Log in
            </Button>
          </Link>
        </Flex>
        {alert}
      </Box>
    </Box>
  );
}
