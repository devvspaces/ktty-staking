"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: (props: { colorMode: string; }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props: { colorMode: string; colorScheme: string; }) => ({
          bg: props.colorMode === 'dark' ? `${props.colorScheme}.400` : `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? `${props.colorScheme}.300` : `${props.colorScheme}.600`,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: props.colorMode === 'dark' ? `${props.colorScheme}.500` : `${props.colorScheme}.700`,
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
          transition: 'all 0.2s',
        }),
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        textTransform: 'none',
        fontWeight: 'medium',
      },
    },
    Card: {
      baseStyle: (props: { colorMode: string; }) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          borderRadius: 'xl',
          boxShadow: 'lg',
          overflow: 'hidden',
        },
      }),
    },
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
