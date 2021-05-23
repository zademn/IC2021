import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "../context";
import { CookiesProvider } from "react-cookie";
function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <Provider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </Provider>
    </CookiesProvider>
  );
}

export default MyApp;
