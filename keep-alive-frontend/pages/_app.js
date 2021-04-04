import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "../context";
function MyApp({ Component, pageProps }) {
  return (
    <Provider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
