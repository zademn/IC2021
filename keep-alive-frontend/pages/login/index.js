import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormHelperText,
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
import { useState, useContext } from "react";
import Header from "../../components/header";
import Link from "next/link";
import { useRouter } from "next/router";
import { Context } from "../../context";
import { useCookies } from "react-cookie";

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

export default function Login() {
  const [show1, setshow1] = useState(false);
  const handleClick1 = () => setshow1(!show1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [alert, setAlert] = useState(null);

  const [cookie, setCookie] = useCookies(["token"]);

  // Context for keeping the username in mind
  const { state, dispatch } = useContext(Context);

  const router = useRouter();

  function handlePass(e) {
    setPassword(e.target.value);
  }

  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function handleSubmit() {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    params.append("grant_type", "");
    params.append("scope", "");
    params.append("client_id", "");
    params.append("client_secret", "");

    axios
      .post(`${process.env.backend}/token`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => {
        setAlert(
          <DisplayAlert
            title="Login"
            description="Succesfully logged in!"
            status="success"
          />
        );
        setCookie("token", `Bearer ${res.data.access_token}`, {
          path: "/",
          maxAge: 3600, // Expires after 1hr
          sameSite: true,
        });
        dispatch({
          type: "LOGGED_IN_USER",
          payload: email,
        });
        router.push("/dashboard");
      })
      .catch((err) => {
        setAlert(
          <DisplayAlert
            title="Error"
            description="Incorrect username or password."
            status="error"
          />
        );
      });
  }
  return (
    <Box>
      <Header name="Login" />
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
        <Flex alignItems="center" justifyContent="space-between">
          <Button
            mt={4}
            colorScheme="teal"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <Link href="/register" passHref>
            <Button mt={4} colorScheme="teal" type="submit" variant="link">
              Register
            </Button>
          </Link>
        </Flex>
        {alert}
      </Box>
    </Box>
  );
}
