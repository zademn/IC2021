import Header from "../../components/header";
import { Box, Button, Text, Center } from "@chakra-ui/react";
import Link from "next/link";
import { Context } from "../../context";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useContext, useEffect, useState } from "react";
import axios from "axios";

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
  const [token, setToken] = useLocalStorage(null, "token");
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
      payload: getUserEmail(token),
    });
  }, [token]);

  console.log(token);

  return (
    <Box>
      <Header name="Dashboard" logout />
      <br />
      {state.user}
    </Box>
  );
}
