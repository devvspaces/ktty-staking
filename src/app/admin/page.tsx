/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  useColorMode,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Progress,
  Tag,
  TagLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Card,
  CardHeader,
  CardBody,
  Switch,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputLeftAddon,
  InputRightAddon,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  DrawerFooter,
  RadioGroup,
  Radio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  AlertIcon,
  ModalFooter,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiMoon,
  FiSun,
  FiSearch,
  FiChevronDown,
  FiPlus,
  FiEdit2,
  FiCheck,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiMinus,
  FiInfo,
  FiMoreVertical,
  FiFlag,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";
import {
  HiOutlineCash,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
} from "@sky-mavis/tanto-connect";
import {
  createPublicClient,
  http,
  formatEther,
  createWalletClient,
  custom,
  parseEther,
} from "viem";
import { saigon, ronin } from "viem/chains";
import abi from "@/lib/abi.json";
import { ERC20_ABI, formatNumberToHuman } from "@/lib/utils";
import useCopy from "@/hook/useCopy";
import moment from "moment";

// Define types
type TierType = {
  id: number;
  name: string;
  range: string;
  minStake: number;
  maxStake: number;
  lockup: number;
  apy: number;
  rewards: string[];
  isActive: boolean;
  active_stakes_amount: number;
  active_stakes_count: number;
};

type StakeStatus = "active" | "ready-to-claim" | "claimed";
type StakeType = {
  id: string;
  walletAddress: string;
  amount: number;
  tier: number;
  tierName: string;
  startDate: string;
  endDate: string;
  rewards: Record<string, number>;
  status: StakeStatus;
};

type TokenBalanceType = {
  symbol: string;
  name: string;
  balance: number;
  required: number;
  color: string;
  address: string;
};

// Motion components
const MotionBox = motion.create(Box);

// Framer Motion variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const STAKING_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as string;
const currentChain =
  (process.env.NEXT_PUBLIC_CHAIN as string) === "ronin" ? ronin : saigon;

const AdminDashboard = () => {
  // Chakra hooks
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const copy = useCopy();
  const {
    isOpen: isOpenSetting,
    onOpen: onOpenSettings,
    onClose: onCloseSettings,
  } = useDisclosure();
  const {
    isOpen: isOpenReports,
    onOpen: onOpenReports,
    onClose: onCloseReports,
  } = useDisclosure();
  const {
    isOpen: isOpenWallet,
    onOpen: onOpenWallet,
    onClose: onCloseWallet,
  } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Mock data
  const [tiers, setTiers] = useState<TierType[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  const fetchTiers = useCallback(async () => {
    try {
      setLoadingTiers(true);
      const response = await fetch("/api/get-tiers");
      const data = await response.json();
      const tiers: TierType[] = data.tiers.map((tier: any) => {
        const min_stake = tier.min_stake;
        const max_stake = tier.max_stake;
        const lockupInDays = tier.lockup_period / (24 * 60 * 60);
        const apy = parseFloat((tier.apy / 100000).toFixed(1));
        const rewards = ["KTTY"];
        if (tier.reward_tokens.length > 0) {
          rewards.push(...tier.reward_tokens.map((token: any) => token.symbol));
        }
        return {
          id: tier.id,
          name: tier.name,
          range: `${formatNumberToHuman(min_stake)} - ${formatNumberToHuman(
            max_stake
          )} $KTTY`,
          lockup: `${lockupInDays}`,
          apy: apy,
          rewards,
          minStake: min_stake,
          maxStake: max_stake,
          isActive: true,
          active_stakes_amount: tier.active_stakes_amount,
          active_stakes_count: tier.active_stakes_count,
        };
      });
      // sort by id
      tiers.sort((a, b) => a.id - b.id);
      setTiers(tiers);
    } finally {
      setLoadingTiers(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // Mock stakes data
  const [stakes, setStakes] = useState<StakeType[]>([]);
  const [fetchingStakes, setFetchingStakes] = useState(false);
  const pageCount = useMemo(() => 15, []);
  const [page, setPage] = useState(0);
  const [stakesTotal, setStakesTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchStakes = useCallback(
    async (query: {
      page: number;
      page_count: number;
      status: StakeStatus;
      tierId: string | null;
      search: string | null;
    }) => {
      const params = new URLSearchParams({
        from: (query.page * query.page_count).toString(),
        page_count: query.page_count.toString(),
        status: query.status,
        tierId: query.tierId || "",
        search: query.search || "",
      });
      try {
        setFetchingStakes(true);
        const response = await fetch(
          `/api/get-stakes-dashboard?${params.toString()}`
        );
        const data = await response.json();
        console.log(data);

        const stakes: StakeType[] = data.stakes.map((stake: any) => {
          return {
            id: stake.id,
            walletAddress: `${stake.owner.substring(
              0,
              6
            )}...${stake.owner.substring(stake.owner.length - 4)}`,
            amount: parseFloat(stake.amount),
            tier: stake.tier,
            tierName: stake.tierName,
            startDate: moment(stake.startDate).format("YYYY-MM-DD"),
            endDate: moment(stake.endDate).format("YYYY-MM-DD"),
            rewards: stake.rewards,
            status: stake.status,
          };
        });
        setStakes(stakes);
        setStakesTotal(data.total);
        if (data.stakes.length >= query.page_count) {
          setHasNext(true);
        } else {
          setHasNext(false);
        }
      } catch (error) {
        console.error("Error fetching stakes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stakes",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setFetchingStakes(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchStakes({
      page: page,
      page_count: pageCount,
      status: statusFilter as StakeStatus,
      tierId: tierFilter === "all" ? null : tierFilter,
      search: "",
    });
  }, [fetchStakes, page, pageCount, statusFilter, tierFilter]);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // clients
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setWalletClient] = useState<any>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const response = await fetch("/api/get-dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      const data = await response.json();
      console.log(data);
      setDashboardData(data);
      setLoadingDashboard(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Token balances
  const tokenColors = useMemo(() => {
    return ["blue", "green", "purple", "cyan", "orange", "red", "pink", "teal"];
  }, []);
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceType[]>([]);
  const [fetchingTokenBalances, setFetchingTokenBalances] = useState(true);
  const [error, setError] = useState<any>(null);
  const [connector, setConnector] = useState<any>(null);
  const [walletDisplay, setWalletDisplay] = useState("");
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const switchChain = async (chainId: any) => {
    try {
      await connector?.switchChain(chainId);
    } catch (error) {
      console.error(error);
    }
  };

  const getRoninWalletConnector = async () => {
    try {
      const connector = await requestRoninWalletConnector();
      return connector;
    } catch (error) {
      if (error instanceof ConnectorError) {
        setError(error.name);
      }
      return null;
    }
  };

  useEffect(() => {
    getRoninWalletConnector().then((connector) => {
      setConnector(connector);
    });
  }, []);

  useEffect(() => {
    try {
      if (!connector && error === ConnectorErrorType.PROVIDER_NOT_FOUND) {
        window.open("https://wallet.roninchain.com", "_blank");
        return;
      }
      // Create Viem clients
      const publicClient = createPublicClient({
        chain: currentChain,
        transport: http(),
      });

      setPublicClient(publicClient);
    } catch (error) {
      console.error("Connection error:", error);
    }
  }, [connector, error]);

  const handleConnect = async () => {
    try {
      if (!connector && error === ConnectorErrorType.PROVIDER_NOT_FOUND) {
        window.open("https://wallet.roninchain.com", "_blank");
        return;
      }

      const connectResult = await connector?.connect();

      if (connectResult) {
        if (connectResult.chainId !== currentChain.id)
          switchChain(currentChain.id);

        const provider = await connector.getProvider();
        const accounts = await connector?.getAccounts();

        const account = accounts[0];

        console.log("Connected account", account);

        setAccount(account);

        provider.handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            setIsConnected(false);
            setAccount(null);
            setWalletDisplay("");
            setShowWalletMenu(false);
          } else {
            setAccount(accounts[0]);
          }
        };

        // Format address for display (0x1234...5678)
        setWalletDisplay(
          `${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`
        );

        // Create Viem clients
        const publicClient = createPublicClient({
          chain: currentChain,
          transport: http(),
        });

        const walletClient = createWalletClient({
          chain: currentChain,
          transport: custom(provider),
        });

        setPublicClient(publicClient);
        setWalletClient(walletClient);

        setIsConnected(true);

        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add disconnect function
  const handleDisconnect = async () => {
    setAccount(null);
    setIsConnected(false);
    setWalletDisplay("");
    setShowWalletMenu(false);

    await connector?.disconnect();

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchTokenBalances = useCallback(async () => {
    if (!publicClient) return;
    try {
      setFetchingTokenBalances(true);
      const response = await fetch("/api/get-reward-tokens-required", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch token balances",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      const data = await response.json();

      const formatted = await Promise.all(
        Object.keys(data).map(async (symbol: any, idx: number) => {
          const balance = await publicClient.readContract({
            address: data[symbol].address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [STAKING_CONTRACT_ADDRESS],
          });
          return {
            symbol,
            name: `${symbol} Token`,
            balance:
              parseFloat(formatEther(balance)) - (data[symbol].stakes ?? 0),
            required: data[symbol].amount ?? 0,
            color: tokenColors[idx % tokenColors.length],
            address: data[symbol].address,
          };
        })
      );
      setTokenBalances(formatted);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setFetchingTokenBalances(false);
    }
  }, [tokenColors, publicClient]);

  useEffect(() => {
    fetchTokenBalances();
  }, [fetchTokenBalances]);

  // For tier edit
  const [editingTier, setEditingTier] = useState<TierType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Token addition state
  const [isAddTokenOpen, setIsAddTokenOpen] = useState<boolean>(false);
  const [newToken, setNewToken] = useState<{
    symbol: string;
    name: string;
    balance: number;
    required: number;
    color: string;
    address: string;
  }>({
    symbol: "",
    name: "",
    balance: 0,
    required: 0,
    color: "blue",
    address: "",
  });
  const [addingToken, setAddingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string>("");

  // Add new token functions
  const validateNewToken = () => {
    if (!newToken.symbol.trim()) {
      setTokenError("Token symbol is required");
      return false;
    }

    if (
      tokenBalances.some((token) => token.symbol === newToken.symbol.trim())
    ) {
      setTokenError("A token with this symbol already exists");
      return false;
    }

    if (newToken.balance < 0 || newToken.required < 0) {
      setTokenError("Balance and required amount must be positive");
      return false;
    }

    setTokenError("");
    return true;
  };

  const handleAddToken = async () => {
    try {
      setAddingToken(true);
      if (validateNewToken()) {
        const tokenToAdd = {
          ...newToken,
          symbol: newToken.symbol.trim().toUpperCase(),
          name: `${newToken.symbol.trim()} Token`,
          address: newToken.address.trim(),
          color: tokenColors[tokenBalances.length % tokenColors.length],
        };

        const hash1 = await walletClient.writeContract({
          account: account,
          address: STAKING_CONTRACT_ADDRESS,
          abi,
          functionName: "registerRewardToken",
          args: [
            newToken.address.trim(),
            newToken.symbol.trim().toUpperCase(),
            BigInt(1),
          ],
        });
        toast({
          title: "Token is being added...",
          description: `Transaction hash: ${hash1}`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        await publicClient.waitForTransactionReceipt({ hash: hash1 });
        toast({
          title: `Successfully added token: ${newToken.symbol
            .trim()
            .toUpperCase()}`,
          description: "Token has been added successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTokenBalances([...tokenBalances, tokenToAdd]);
        setIsAddTokenOpen(false);
        setNewToken({
          symbol: "",
          name: "",
          balance: 0,
          required: 0,
          color: "blue",
          address: "",
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setAddingToken(false);
    }
  };

  // Token action states
  const [tokenActionDialog, setTokenActionDialog] = useState<{
    isOpen: boolean;
    type: "deposit" | "withdraw";
    token: TokenBalanceType | null;
  }>({
    isOpen: false,
    type: "deposit",
    token: null,
  });
  const [tokenAmount, setTokenAmount] = useState<number>(0);

  // Format large numbers
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Handle tier edit
  const handleEditTier = (tier: TierType) => {
    setEditingTier({ ...tier });
    setIsEditDialogOpen(true);
  };

  // Save tier changes
  const [savingTier, setSavingTier] = useState(false);
  const saveTierChanges = async () => {
    if (!walletClient) return;
    try {
      setSavingTier(true);
      if (editingTier) {
        const hash1 = await walletClient.writeContract({
          account: account,
          address: STAKING_CONTRACT_ADDRESS,
          abi,
          functionName: "updateTier",
          args: [
            editingTier.id,
            editingTier.name,
            parseEther(editingTier.minStake.toString()),
            parseEther(editingTier.maxStake.toString()),
            editingTier.lockup,
            editingTier.apy * 100000,
            editingTier.isActive,
          ],
        });
        toast({
          title: "Updating tier...",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash: hash1 });
        toast({
          title: "Tier updated",
          description: `You've successfully updated Tier #${editingTier.id}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTiers(
          tiers.map((tier) => (tier.id === editingTier.id ? editingTier : tier))
        );
        setIsEditDialogOpen(false);
        setEditingTier(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTier(false);
    }
  };

  // Toggle tier reward token
  const toggleTierReward = async (token: TokenBalanceType) => {
    if (!walletClient) return;

    try {
      setSavingTier(true);
      if (editingTier) {
        let hash1 = null;
        if (editingTier.rewards.includes(token.symbol)) {
          hash1 = await walletClient.writeContract({
            account: account,
            address: STAKING_CONTRACT_ADDRESS,
            abi,
            functionName: "removeRewardTokenFromTier",
            args: [
              editingTier.id,
              token.address,
            ],
          });
        } else {
          hash1 = await walletClient.writeContract({
            account: account,
            address: STAKING_CONTRACT_ADDRESS,
            abi,
            functionName: "addRewardTokenToTier",
            args: [
              editingTier.id,
              token.address,
            ],
          });
        }
        toast({
          title: "Updating tier reward tokens...",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        await publicClient.waitForTransactionReceipt({ hash: hash1 });
        toast({
          title: "Tier reward tokens updated",
          description: `You've successfully updated Tier #${editingTier.id} reward tokens`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        const updatedRewards = editingTier.rewards.includes(token.symbol)
          ? editingTier.rewards.filter((reward) => reward !== token.symbol)
          : [...editingTier.rewards, token.symbol];
        setEditingTier({
          ...editingTier,
          rewards: updatedRewards,
        });
        setTiers(
          tiers.map((tier) => (tier.id === editingTier.id ? {
            ...tier,
            rewards: updatedRewards,
          } : tier))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTier(false);
    }
  };

  // Handle token action
  const openTokenAction = (
    type: "deposit" | "withdraw",
    token: TokenBalanceType
  ) => {
    setTokenActionDialog({
      isOpen: true,
      type,
      token,
    });
    setTokenAmount(0);
  };

  function shortAddress(address: string) {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }

  // Execute token action
  const executeTokenAction = async () => {
    if (tokenActionDialog.token && tokenAmount > 0) {
      const updatedBalances = await Promise.all(
        tokenBalances.map(async (token) => {
          if (token.symbol === tokenActionDialog.token?.symbol) {
            let newBalance = token.balance;
            if (tokenActionDialog.type === "deposit") {
              const hash1 = await walletClient.writeContract({
                account: account,
                address: token.address,
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [
                  STAKING_CONTRACT_ADDRESS,
                  parseEther(tokenAmount.toString()),
                ],
              });
              toast({
                title: `Transfer in progress`,
                description: `Transfer transaction submitted.`,
                status: "info",
                duration: 3000,
                isClosable: true,
              });
              // Wait for transaction confirmation
              await publicClient.waitForTransactionReceipt({ hash: hash1 });
              toast({
                title: "Transfer successful",
                description: `You've deposited ${tokenAmount} ${token.symbol}`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
              newBalance += tokenAmount;
            } else {
              // newBalance -= tokenAmount;
            }
            return {
              ...token,
              balance: newBalance < 0 ? 0 : newBalance,
            };
          }
          return token;
        })
      );

      setTokenBalances(updatedBalances);
      setTokenActionDialog({ isOpen: false, type: "deposit", token: null });
      setTokenAmount(0);
    }
  };

  // Calculate token status
  const getTokenStatus = (token: TokenBalanceType) => {
    const ratio = token.balance / token.required;
    if (ratio >= 1.5) return "abundant";
    if (ratio >= 1.1) return "sufficient";
    if (ratio >= 0.9) return "adequate";
    if (ratio >= 0.7) return "warning";
    return "critical";
  };

  // Get color scheme for token status
  const getTokenStatusColor = (status: string) => {
    switch (status) {
      case "abundant":
        return "green";
      case "sufficient":
        return "teal";
      case "adequate":
        return "blue";
      case "warning":
        return "yellow";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  // Container animation
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const bgR5R9 = useColorModeValue("red.50", "red.900");
  const tierColors = ["purple", "teal", "orange", "green", "blue"];

  const clr2 = useColorModeValue("gray.100", "gray.700");
  const clr3 = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex h="100vh">
      {/* Main Content */}
      <Box
        flex="1"
        overflow="auto"
        bg={useColorModeValue("gray.50", "gray.900")}
        w={"100%"}
      >
        {/* Navbar */}
        <Flex
          px={4}
          h="64px"
          align="center"
          justify="space-between"
          bg={bgColor}
          boxShadow="sm"
          borderBottom="1px"
          borderColor={borderColor}
          w={"100%"}
        >
          <HStack spacing={3} w={"100%"}>
            <Text mr={"auto"} fontWeight="bold" fontSize="lg">
              KTTY Admin
            </Text>
            <Tooltip label={colorMode === "light" ? "Dark Mode" : "Light Mode"}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                variant="ghost"
                onClick={toggleColorMode}
                size="md"
              />
            </Tooltip>

            {isConnected ? (
              <Box position="relative">
                <Button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  variant="ghost"
                  px={4}
                  bg={clr2}
                  _hover={{ bg: clr3 }}
                  borderRadius="xl"
                  rightIcon={
                    <Box as="span" ml={1}>
                      ▼
                    </Box>
                  }
                >
                  <HStack spacing={2}>
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg="green.400"
                      boxShadow="0 0 0 2px white"
                    />
                    <Text>{walletDisplay}</Text>
                  </HStack>
                </Button>

                {showWalletMenu && (
                  <Box
                    position="absolute"
                    top="100%"
                    right="0"
                    mt={2}
                    bg={cardBg}
                    boxShadow="lg"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={4}
                    width="240px"
                    zIndex={10}
                  >
                    <VStack align="stretch" spacing={3}>
                      <Box mb={2}>
                        <Text fontSize="sm" opacity={0.7}>
                          Wallet Address
                        </Text>
                        <Text fontSize="sm" fontWeight="medium" isTruncated>
                          {account}
                        </Text>
                      </Box>

                      <Divider />

                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={onOpenSettings}
                        leftIcon={<FiSettings />}
                      >
                        Settings
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={handleDisconnect}
                        leftIcon={<Box as="span">⏻</Box>}
                      >
                        Disconnect Wallet
                      </Button>
                    </VStack>
                  </Box>
                )}
              </Box>
            ) : (
              <Button
                onClick={handleConnect}
                color={"white"}
                bg={"#b78af3"}
                leftIcon={<HiOutlineLightningBolt />}
                rounded="full"
                size="md"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
              >
                Connect Wallet
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Page Content */}
        <Container maxW="1600px" py={6} px={{ base: 4, md: 6 }}>
          {/* Admin Tabs */}
          <Tabs
            onChange={(index) => {
              if (index === 1) {
                fetchTiers();
              }
              if (index === 2 && stakes.length === 0) {
                fetchStakes({
                  page,
                  page_count: pageCount,
                  status: statusFilter as StakeStatus,
                  tierId: tierFilter === "all" ? null : tierFilter,
                  search: searchTerm,
                });
              }
            }}
            variant="line"
            colorScheme="blue"
            isLazy
          >
            <TabList
              overflowX="auto"
              css={css`
                scrollbar-width: thin;
                &::-webkit-scrollbar {
                  height: 6px;
                }
                &::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.2);
                  border-radius: 3px;
                }
              `}
              mb={6}
            >
              <Tab fontWeight="medium" px={5} whiteSpace={"nowrap"}>
                Dashboard
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={"nowrap"}>
                Tier Management
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={"nowrap"}>
                Analytics
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={"nowrap"}>
                Token Management
              </Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel p={0}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerAnimation}
                >
                  <Grid
                    templateColumns={{ base: "1fr", xl: "repeat(4, 1fr)" }}
                    gap={6}
                    mb={6}
                  >
                    {/* Overview Stats */}
                    <GridItem colSpan={{ base: 1, xl: 4 }}>
                      <Flex
                        justify="space-between"
                        align="center"
                        mb={6}
                        gap={3}
                        wrap={"wrap"}
                      >
                        <Heading size="lg">Dashboard Overview</Heading>

                        <Button
                          leftIcon={<FiRefreshCw />}
                          colorScheme="blue"
                          size="sm"
                          onClick={fetchDashboard}
                          isLoading={loadingDashboard}
                        >
                          Sync with Blockchain
                        </Button>
                      </Flex>
                    </GridItem>

                    {/* Total Staked */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <HStack mb={2}>
                            <Icon
                              as={HiOutlineCash}
                              color="blue.500"
                              boxSize={5}
                            />
                            <Text>Total KTTY Staked</Text>
                          </HStack>
                          <Heading size="lg">
                            {formatNumber(
                              dashboardData?.overview?.totalStaked ?? 0
                            )}{" "}
                            KTTY
                          </Heading>
                          <Text mt={2} color="gray.500">
                            Across {dashboardData?.overview?.activeStakes ?? 0}{" "}
                            active stakes
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Active Stakes */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <HStack mb={2}>
                            <Icon
                              as={HiOutlineShieldCheck}
                              color="green.500"
                              boxSize={5}
                            />
                            <Text>Active Stakes</Text>
                          </HStack>
                          <Heading size="lg">
                            {dashboardData?.overview?.activeStakes ?? 0}
                          </Heading>
                          <HStack mt={2}>
                            <Text color="gray.500">
                              Completed:{" "}
                              {dashboardData?.overview?.completedStakes ?? 0}
                            </Text>
                            <Text color="gray.500">
                              Total: {dashboardData?.overview?.totalStakes ?? 0}
                            </Text>
                          </HStack>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Rewards Distributed */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <HStack mb={2}>
                            <Icon
                              as={HiOutlineLightningBolt}
                              color="yellow.500"
                              boxSize={5}
                            />
                            <Text>Total Rewards Distributed</Text>
                          </HStack>
                          <Heading size="lg">
                            {formatNumber(
                              dashboardData?.overview?.totalRewards?.ktty ?? 0
                            )}{" "}
                            KTTY
                          </Heading>
                          <Text mt={2} color="gray.500">
                            +
                            {formatNumber(
                              dashboardData?.overview?.totalRewards?.other ?? 0
                            )}{" "}
                            other tokens
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>

                  {/* Quick Access Sections */}
                  <Grid
                    templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
                    gap={6}
                  >
                    {/* Recent Stakes */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card mb={6}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="md">Recent Stakes</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody
                          maxW={{
                            base: "calc(100vw - 42px)",
                            md: "none",
                          }}
                          overflowX={"scroll"}
                        >
                          <Spinner hidden={!loadingDashboard} />
                          <Table
                            hidden={loadingDashboard}
                            variant="simple"
                            size="sm"
                          >
                            <Thead>
                              <Tr>
                                <Th>Wallet</Th>
                                <Th>Amount</Th>
                                <Th>Tier</Th>
                                <Th>Start Date</Th>
                                <Th>Status</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {dashboardData?.recentStakes?.map(
                                (stake: any, idx: number) => (
                                  <Tr key={idx}>
                                    <Td>{shortAddress(stake.wallet)}</Td>
                                    <Td>{formatNumber(stake.amount)} KTTY</Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          tierColors[idx % tierColors.length]
                                        }
                                      >
                                        {stake.tier}
                                      </Badge>
                                    </Td>
                                    <Td>{stake.startDate}</Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          stake.status === "active"
                                            ? "green"
                                            : "gray"
                                        }
                                      >
                                        {stake.status}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </Card>

                      {/* Distribution by Tier */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">
                            Stakes Distribution by Tier
                          </Heading>
                        </CardHeader>
                        <Box p={4} hidden={!loadingDashboard}>
                          <Spinner hidden={!loadingDashboard} />
                        </Box>
                        {dashboardData?.stakesDistribution && (
                          <>
                            <CardBody hidden={loadingDashboard}>
                              {Object.values(
                                dashboardData?.stakesDistribution
                              ).map((tier: any, idx: number) => {
                                return (
                                  <Box key={idx} mb={4}>
                                    <Flex justify="space-between" mb={1}>
                                      <Text fontWeight="medium">
                                        {tier.name}
                                      </Text>
                                      <Text>
                                        {formatNumber(tier.amount)} KTTY (
                                        {tier.percentage.toFixed(1)}%)
                                      </Text>
                                    </Flex>
                                    <Progress
                                      value={tier.percentage}
                                      size="sm"
                                      borderRadius="full"
                                      colorScheme={
                                        tierColors[idx % tierColors.length]
                                      }
                                    />
                                  </Box>
                                );
                              })}
                            </CardBody>
                          </>
                        )}
                      </Card>
                    </GridItem>

                    {/* Token Balances */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card mb={6}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="md">Reward Token Balances</Heading>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiRefreshCw />}
                              isLoading={fetchingTokenBalances}
                              onClick={fetchTokenBalances}
                            >
                              Refresh
                            </Button>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          {tokenBalances.map((token) => {
                            const status = getTokenStatus(token);
                            const colorScheme = getTokenStatusColor(status);
                            const percentage =
                              (token.balance / token.required) * 100;

                            return (
                              <Box key={token.symbol} mb={4}>
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  mb={1}
                                >
                                  <HStack>
                                    <Tag
                                      size="md"
                                      colorScheme={token.color}
                                      borderRadius="full"
                                      px={3}
                                    >
                                      <TagLabel>{token.symbol}</TagLabel>
                                    </Tag>
                                    <Text>{token.name}</Text>
                                  </HStack>
                                  <HStack>
                                    <IconButton
                                      aria-label="Deposit"
                                      icon={<FiPlus />}
                                      size="xs"
                                      colorScheme="green"
                                      isDisabled={!isConnected}
                                      onClick={() =>
                                        openTokenAction("deposit", token)
                                      }
                                    />
                                    <IconButton
                                      aria-label="Withdraw"
                                      icon={<FiMinus />}
                                      size="xs"
                                      colorScheme="red"
                                      isDisabled={
                                        token.balance <= 0 || !isConnected
                                      }
                                      onClick={() =>
                                        openTokenAction("withdraw", token)
                                      }
                                    />
                                  </HStack>
                                </Flex>
                                <Flex justify="space-between" mb={1}>
                                  <Text fontSize="sm" color="gray.500">
                                    Balance: {formatNumber(token.balance)}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    Required: {formatNumber(token.required)}
                                  </Text>
                                </Flex>
                                <Progress
                                  value={percentage}
                                  size="sm"
                                  borderRadius="full"
                                  colorScheme={colorScheme}
                                />
                                {percentage < 100 && (
                                  <Text
                                    fontSize="sm"
                                    color={`${colorScheme}.500`}
                                    mt={1}
                                  >
                                    {status === "critical"
                                      ? "Critical low balance!"
                                      : "Low balance warning"}
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                        </CardBody>
                      </Card>

                      {/* System Status */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">System Status</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <Text>Staking Contract</Text>
                              <Tag colorScheme="green">Active</Tag>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Reward Distribution</Text>
                              <Tag colorScheme="green">Running</Tag>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Last Block Sync</Text>
                              <Text>12 seconds ago</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </MotionBox>
              </TabPanel>

              {/* Tier Management Tab */}
              <TabPanel p={0}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerAnimation}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    gap={3}
                    wrap={"wrap"}
                  >
                    <Heading size="lg">Tier Management</Heading>
                    <HStack>
                      <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        size="sm"
                        onClick={fetchTiers}
                        isLoading={loadingTiers}
                      >
                        Sync with Blockchain
                      </Button>
                    </HStack>
                  </Flex>

                  <Spinner hidden={!loadingTiers} />

                  {/* Tier Cards */}
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap={6}
                  >
                    {tiers.map((tier) => {
                      return (
                        <GridItem
                          key={tier.id}
                          as={MotionBox}
                          variants={fadeIn}
                        >
                          <Card
                            borderWidth="1px"
                            borderColor={
                              tier.isActive ? borderColor : "red.300"
                            }
                            bg={tier.isActive ? cardBg : bgR5R9}
                          >
                            <CardHeader pb={2}>
                              <Flex justify="space-between" align="center">
                                <Heading size="md">{tier.name}</Heading>
                                <HStack>
                                  <IconButton
                                    isDisabled={!isConnected || !walletClient}
                                    aria-label="Edit tier"
                                    icon={<FiEdit2 />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTier(tier)}
                                  />
                                </HStack>
                              </Flex>
                            </CardHeader>
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">Staking Range</Text>
                                  <Text>{tier.range}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">Min Stake</Text>
                                  <Text>
                                    {formatNumberToHuman(tier.minStake)} KTTY
                                  </Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">Lockup Period</Text>
                                  <Text>{tier.lockup} days</Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">APY</Text>
                                  <Text fontWeight="bold" color="green.500">
                                    {tier.apy}%
                                  </Text>
                                </Flex>
                                <Box>
                                  <Text fontWeight="medium" mb={2}>
                                    Reward Tokens
                                  </Text>
                                  <HStack spacing={2} flexWrap="wrap">
                                    {tier.rewards.map((reward, idx) => (
                                      <Tag
                                        key={reward}
                                        colorScheme={
                                          tokenColors[idx % tokenColors.length]
                                        }
                                        mb={2}
                                      >
                                        {reward}
                                      </Tag>
                                    ))}
                                  </HStack>
                                </Box>
                                <Box>
                                  <Text fontWeight="medium" mb={2}>
                                    Current Stats
                                  </Text>
                                  <HStack justify="space-between">
                                    <Text fontSize="sm">Active Stakes:</Text>
                                    <Text fontSize="sm">
                                      {tier.active_stakes_count}
                                    </Text>
                                  </HStack>
                                  <HStack justify="space-between">
                                    <Text fontSize="sm">Total Staked:</Text>
                                    <Text fontSize="sm">
                                      {formatNumber(
                                        tier.active_stakes_amount ?? 0
                                      )}{" "}
                                      KTTY
                                    </Text>
                                  </HStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        </GridItem>
                      );
                    })}
                  </Grid>
                </MotionBox>
              </TabPanel>

              {/* Analytics Tab */}
              <TabPanel p={0}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerAnimation}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    gap={3}
                    wrap={"wrap"}
                  >
                    <Heading size="lg">Staking Analytics</Heading>
                    <HStack wrap={"wrap"}>
                      <Select
                        width="150px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="ready-to-claim">Ready to Claim</option>
                        <option value="claimed">Claimed</option>
                      </Select>
                      <Select
                        width="150px"
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Tiers</option>
                        {tiers.map((tier) => (
                          <option key={tier.id} value={tier.id.toString()}>
                            {tier.name}
                          </option>
                        ))}
                      </Select>
                      <InputGroup width="200px" size="sm">
                        <Input
                          placeholder="Search wallet..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputRightElement>
                          <FiSearch color="gray.300" />
                        </InputRightElement>
                      </InputGroup>
                      <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => {
                          fetchStakes({
                            page,
                            page_count: pageCount,
                            status: statusFilter as StakeStatus,
                            tierId: tierFilter === "all" ? null : tierFilter,
                            search: searchTerm,
                          });
                        }}
                        isLoading={fetchingStakes}
                      >
                        Sync Stakes
                      </Button>
                    </HStack>
                  </Flex>

                  {/* Stats Overview */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                    gap={6}
                    mb={6}
                  >
                    {/* Active Stakes Card */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Active Stakes</StatLabel>
                            <StatNumber>
                              {dashboardData?.overview?.activeStakes ?? 0}
                            </StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Completed Stakes Card */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Completed Stakes</StatLabel>
                            <StatNumber>
                              {dashboardData?.overview?.completedStakes ?? 0}
                            </StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Total Value Locked Card */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Value Locked</StatLabel>
                            <StatNumber>
                              {formatNumber(
                                dashboardData?.overview?.totalStaked ?? 0
                              )}{" "}
                              KTTY
                            </StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Rewards Distributed Card */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Rewards Distributed</StatLabel>
                            <StatNumber>
                              {formatNumber(
                                dashboardData?.overview?.totalRewards?.ktty ?? 0
                              )}{" "}
                              KTTY
                            </StatNumber>
                          </Stat>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>

                  {/* Analytics Table */}
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={bgColor}
                    shadow="sm"
                    mb={6}
                  >
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Wallet Address</Th>
                            <Th>Amount</Th>
                            <Th>Tier</Th>
                            <Th>Start Date</Th>
                            <Th>End Date</Th>
                            <Th>Rewards</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {stakes.map((stake) => (
                            <Tr key={stake.id}>
                              <Td fontFamily="mono">{stake.id}</Td>
                              <Td fontFamily="mono">{stake.walletAddress}</Td>
                              <Td>{formatNumber(stake.amount)} KTTY</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    tierColors[stake.tier % tierColors.length]
                                  }
                                >
                                  {stake.tierName}
                                </Badge>
                              </Td>
                              <Td>{stake.startDate}</Td>
                              <Td>{stake.endDate}</Td>
                              <Td>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    rightIcon={<FiChevronDown />}
                                    size="xs"
                                  >
                                    View
                                  </MenuButton>
                                  <MenuList fontSize="sm">
                                    {Object.entries(stake.rewards).map(
                                      ([token, amount]) => (
                                        <MenuItem key={token}>
                                          {token}: {formatNumber(amount)}
                                        </MenuItem>
                                      )
                                    )}
                                  </MenuList>
                                </Menu>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    stake.status === "active"
                                      ? "green"
                                      : stake.status === "ready-to-claim"
                                      ? "blue"
                                      : "gray"
                                  }
                                >
                                  {stake.status}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>

                    {stakes.length === 0 && (
                      <Box p={4} textAlign="center" color="gray.500">
                        No stakes found for the selected filters.
                      </Box>
                    )}

                    <Flex
                      justify="space-between"
                      align="center"
                      p={4}
                      borderTopWidth="1px"
                    >
                      <Text fontSize="sm">
                        Page {page + 1} of {Math.ceil(stakesTotal / pageCount)}{" "}
                        stakes
                      </Text>
                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FiChevronLeft />}
                          isDisabled={page === 0}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => setPage(page + 1)}
                          isDisabled={!hasNext}
                          size="sm"
                          rightIcon={<FiChevronRight />}
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                </MotionBox>
              </TabPanel>

              {/* Token Management Tab */}
              <TabPanel p={0}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerAnimation}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    wrap={"wrap"}
                    gap={3}
                  >
                    <Heading size="lg">Token Management</Heading>
                    <HStack>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => setIsAddTokenOpen(true)}
                      >
                        Add New Token
                      </Button>
                      <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        size="sm"
                        onClick={fetchTokenBalances}
                        isLoading={fetchingTokenBalances}
                      >
                        Sync Balances
                      </Button>
                    </HStack>
                  </Flex>

                  {/* Token Stats Overview */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={6}
                    mb={6}
                  >
                    {/* Contract Balance */}
                    <GridItem as={Card}>
                      <CardHeader>
                        <Heading size="md">Contract Balance</Heading>
                      </CardHeader>
                      <CardBody>
                        <Flex
                          justify="space-between"
                          align="center"
                          flexWrap={"wrap"}
                        >
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Smart Contract Address
                            </Text>
                            <Text fontFamily="mono">
                              {STAKING_CONTRACT_ADDRESS}
                            </Text>
                          </Box>
                          <Button
                            leftIcon={<FiCopy />}
                            size="sm"
                            variant="ghost"
                            onClick={copy(STAKING_CONTRACT_ADDRESS)}
                          >
                            Copy
                          </Button>
                        </Flex>
                      </CardBody>
                    </GridItem>

                    {/* Required Token Balance */}
                    <GridItem as={Card}>
                      <CardHeader>
                        <Heading size="md">Reward Projections</Heading>
                      </CardHeader>
                      <CardBody>
                        <Flex justify="space-between" mb={2}>
                          <Text>Required for next 30 days</Text>
                          <Text
                            fontWeight="bold"
                            color={
                              tokenBalances.some((t) => t.balance < t.required)
                                ? "red.500"
                                : "green.500"
                            }
                          >
                            {tokenBalances.some((t) => t.balance < t.required)
                              ? "Insufficient"
                              : "Sufficient"}
                          </Text>
                        </Flex>
                        <Divider my={4} />
                        <Text fontSize="sm" mb={2}>
                          Projected token needs for reward payments:
                        </Text>
                        {tokenBalances.map((token) => (
                          <HStack
                            key={token.symbol}
                            justify="space-between"
                            mb={2}
                          >
                            <Text>{token.symbol}</Text>
                            <Text
                              color={
                                token.balance < token.required
                                  ? "red.500"
                                  : "green.500"
                              }
                            >
                              {formatNumber(token.required)}
                            </Text>
                          </HStack>
                        ))}
                      </CardBody>
                    </GridItem>
                  </Grid>

                  {/* Token Details */}
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={6}
                  >
                    {tokenBalances.map((token) => {
                      const status = getTokenStatus(token);
                      const colorScheme = getTokenStatusColor(status);
                      const percentage = (token.balance / token.required) * 100;

                      return (
                        <GridItem
                          key={token.symbol}
                          as={Card}
                          borderLeftWidth="4px"
                          borderLeftColor={`${token.color}.500`}
                        >
                          <CardHeader>
                            <Flex justify="space-between" align="center">
                              <HStack>
                                <Tag
                                  size="lg"
                                  colorScheme={token.color}
                                  borderRadius="full"
                                  px={3}
                                >
                                  <TagLabel>{token.symbol}</TagLabel>
                                </Tag>
                                <Heading size="md">{token.name}</Heading>
                              </HStack>
                              <HStack>
                                <Button
                                  colorScheme="green"
                                  leftIcon={<FiPlus />}
                                  size="sm"
                                  onClick={() =>
                                    openTokenAction("deposit", token)
                                  }
                                  isDisabled={!isConnected}
                                >
                                  Deposit
                                </Button>
                                <Button
                                  colorScheme="red"
                                  leftIcon={<FiMinus />}
                                  size="sm"
                                  isDisabled={token.balance <= 0}
                                  onClick={() =>
                                    openTokenAction("withdraw", token)
                                  }
                                >
                                  Withdraw
                                </Button>
                              </HStack>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <Box>
                              <Text fontWeight="medium" mb={2}>
                                Balance and Requirements
                              </Text>
                              <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                                <Box p={4} bg={cardBg} borderRadius="md">
                                  <Text fontSize="sm" color="gray.500">
                                    Current Balance
                                  </Text>
                                  <Text fontSize="2xl" fontWeight="bold">
                                    {formatNumber(token.balance)}
                                  </Text>
                                </Box>
                                <Box p={4} bg={cardBg} borderRadius="md">
                                  <Text fontSize="sm" color="gray.500">
                                    Required Amount
                                  </Text>
                                  <Text fontSize="2xl" fontWeight="bold">
                                    {formatNumber(token.required)}
                                  </Text>
                                </Box>
                              </Grid>
                              <Text fontWeight="medium" mb={2}>
                                Status
                              </Text>
                              <Box mb={2}>
                                <Flex justify="space-between" mb={1}>
                                  <Text>Balance Sufficiency</Text>
                                  <Badge colorScheme={colorScheme}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </Badge>
                                </Flex>
                                <Progress
                                  value={percentage}
                                  size="md"
                                  borderRadius="full"
                                  colorScheme={colorScheme}
                                />
                              </Box>
                              {percentage < 100 && (
                                <Alert
                                  status="warning"
                                  borderRadius="md"
                                  mt={4}
                                >
                                  <HStack>
                                    <Icon as={FiAlertTriangle} />
                                    <Text>
                                      {status === "critical"
                                        ? `Critical low balance! Need ${formatNumber(
                                            token.required - token.balance
                                          )} more ${token.symbol} tokens`
                                        : `Low balance warning. Consider depositing more ${token.symbol} tokens`}
                                    </Text>
                                  </HStack>
                                </Alert>
                              )}
                            </Box>
                          </CardBody>
                        </GridItem>
                      );
                    })}
                  </Grid>
                </MotionBox>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>

      {/* Edit Tier Dialog */}
      <AlertDialog
        isOpen={isEditDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsEditDialogOpen(false)}
        size="lg"
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Edit {editingTier?.name}
            </AlertDialogHeader>

            <AlertDialogBody>
              {editingTier && (
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Tier Name</FormLabel>
                    <Input
                      value={editingTier.name}
                      onChange={(e) =>
                        setEditingTier({ ...editingTier, name: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Minimum Stake (KTTY)</FormLabel>
                    <NumberInput
                      value={editingTier.minStake}
                      onChange={(valueString) => {
                        const value = parseInt(valueString);
                        setEditingTier({
                          ...editingTier,
                          minStake: isNaN(value) ? 0 : value,
                        });
                      }}
                      min={0}
                      step={100000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Maximum Stake (KTTY)</FormLabel>
                    <NumberInput
                      value={editingTier.maxStake}
                      onChange={(valueString) => {
                        const value = parseInt(valueString);
                        setEditingTier({
                          ...editingTier,
                          minStake: isNaN(value) ? 0 : value,
                        });
                      }}
                      min={0}
                      step={100000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Lockup Period (Days)</FormLabel>
                    <NumberInput
                      value={editingTier.lockup}
                      onChange={(valueString) => {
                        const value = parseInt(valueString);
                        setEditingTier({
                          ...editingTier,
                          lockup: isNaN(value) ? 0 : value,
                        });
                      }}
                      min={1}
                      max={365}
                      step={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>APY (%)</FormLabel>
                    <NumberInput
                      value={editingTier.apy}
                      onChange={(valueString) => {
                        const value = parseFloat(valueString);
                        setEditingTier({
                          ...editingTier,
                          apy: isNaN(value) ? 0 : value,
                        });
                      }}
                      min={0}
                      max={100}
                      step={0.1}
                      precision={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>Annual Percentage Yield</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Reward Tokens</FormLabel>
                    <Stack
                      direction={["column", "row"]}
                      spacing={3}
                      wrap="wrap"
                    >
                      {tokenBalances
                        .map((i, idx) => (
                          <Button
                            key={i.symbol}
                            isDisabled={!isConnected || !walletClient || savingTier}
                            size="sm"
                            colorScheme={tokenColors[idx % tokenColors.length]}
                            leftIcon={
                              editingTier.rewards.includes(i.symbol) ? (
                                <FiCheck />
                              ) : undefined
                            }
                            onClick={() => toggleTierReward(i)}
                            mb={2}
                          >
                            {i.symbol}
                          </Button>
                        ))}
                    </Stack>
                    <FormHelperText>
                      Select the tokens to include in this tier&apos;s rewards
                    </FormHelperText>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="tier-active" mb="0">
                      Is Active
                    </FormLabel>
                    <Switch
                      id="tier-active"
                      isChecked={editingTier.isActive}
                      onChange={() =>
                        setEditingTier({
                          ...editingTier,
                          isActive: !editingTier.isActive,
                        })
                      }
                      colorScheme="green"
                    />
                  </FormControl>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                isDisabled={!isConnected || !walletClient}
                isLoading={savingTier}
                colorScheme="blue"
                onClick={saveTierChanges}
                ml={3}
              >
                Save Changes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Token Action Dialog */}
      <AlertDialog
        isOpen={tokenActionDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() =>
          setTokenActionDialog({ isOpen: false, type: "deposit", token: null })
        }
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {tokenActionDialog.type === "deposit" ? "Deposit" : "Withdraw"}{" "}
              {tokenActionDialog.token?.symbol}
            </AlertDialogHeader>

            <AlertDialogBody>
              {tokenActionDialog.token && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Tag
                      size="lg"
                      colorScheme={tokenActionDialog.token.color}
                      borderRadius="full"
                      px={3}
                    >
                      <TagLabel>{tokenActionDialog.token.symbol}</TagLabel>
                    </Tag>
                    <Text>{tokenActionDialog.token.name}</Text>
                  </HStack>

                  <FormControl>
                    <FormLabel>Current Balance</FormLabel>
                    <Text fontWeight="medium">
                      {formatNumber(tokenActionDialog.token.balance)}{" "}
                      {tokenActionDialog.token.symbol}
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      {tokenActionDialog.type === "deposit"
                        ? "Amount to Deposit"
                        : "Amount to Withdraw"}
                    </FormLabel>
                    <InputGroup>
                      <NumberInput
                        value={tokenAmount}
                        onChange={(valueString) => {
                          const value = parseInt(valueString);
                          setTokenAmount(isNaN(value) ? 0 : value);
                        }}
                        min={0}
                        max={
                          tokenActionDialog.type === "withdraw"
                            ? tokenActionDialog.token.balance
                            : undefined
                        }
                        step={1000}
                        w="full"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <InputRightAddon>
                        {tokenActionDialog.token.symbol}
                      </InputRightAddon>
                    </InputGroup>
                    {tokenActionDialog.type === "withdraw" && (
                      <FormHelperText>
                        Maximum: {formatNumber(tokenActionDialog.token.balance)}{" "}
                        {tokenActionDialog.token.symbol}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {tokenActionDialog.type === "deposit" && (
                    <Alert status="info" borderRadius="md">
                      <HStack>
                        <Icon as={FiInfo} />
                        <Text>
                          Ensure you have sufficient{" "}
                          {tokenActionDialog.token.symbol} in your wallet before
                          proceeding.
                        </Text>
                      </HStack>
                    </Alert>
                  )}

                  {tokenActionDialog.type === "withdraw" &&
                    tokenActionDialog.token.balance <
                      tokenActionDialog.token.required && (
                      <Alert status="warning" borderRadius="md">
                        <HStack>
                          <Icon as={FiAlertTriangle} />
                          <Text>
                            Current balance is below the required amount for
                            rewards.
                          </Text>
                        </HStack>
                      </Alert>
                    )}
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() =>
                  setTokenActionDialog({
                    isOpen: false,
                    type: "deposit",
                    token: null,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                colorScheme={
                  tokenActionDialog.type === "deposit" ? "green" : "red"
                }
                onClick={executeTokenAction}
                ml={3}
                isDisabled={tokenAmount <= 0}
              >
                {tokenActionDialog.type === "deposit" ? "Deposit" : "Withdraw"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Settings Panel - We can add this as a floating panel */}
      <Drawer
        isOpen={isOpenSetting} // This would be controlled by a state variable
        placement="right"
        onClose={onCloseSettings} // This would call a function to close the drawer
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">System Settings</DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={4}>
              <Box>
                <Heading size="sm" mb={4}>
                  Contract Settings
                </Heading>
                <FormControl mb={4}>
                  <FormLabel>Smart Contract Address</FormLabel>
                  <InputGroup>
                    <Input value={STAKING_CONTRACT_ADDRESS} isReadOnly />
                    <InputRightElement>
                      <IconButton
                        aria-label="Copy"
                        icon={<FiCopy />}
                        size="sm"
                        variant="ghost"
                        onClick={copy(STAKING_CONTRACT_ADDRESS)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Admin Wallet Address</FormLabel>
                  <InputGroup>
                    <Input value="" isReadOnly />
                    <InputRightElement>
                      <IconButton
                        aria-label="Copy"
                        icon={<FiCopy />}
                        size="sm"
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Block Confirmation Threshold</FormLabel>
                  <NumberInput defaultValue={12} min={1} max={50}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    Number of blocks to wait for confirmation
                  </FormHelperText>
                </FormControl>
              </Box>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onCloseSettings}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save Changes</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Reports Drawer - For generating and downloading reports */}
      <Drawer
        isOpen={isOpenReports} // This would be controlled by a state variable
        placement="right"
        onClose={onCloseReports} // This would call a function to close the drawer
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Generate Reports</DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={4}>
              <Box>
                <Heading size="sm" mb={4}>
                  Report Type
                </Heading>
                <RadioGroup defaultValue="staking">
                  <Stack direction="column" spacing={3}>
                    <Radio value="staking">Staking Activity Report</Radio>
                    <Radio value="rewards">Rewards Distribution Report</Radio>
                    <Radio value="tokens">Token Balance Report</Radio>
                    <Radio value="user">User Activity Report</Radio>
                    <Radio value="custom">Custom Report</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={4}>
                  Time Period
                </Heading>
                <FormControl mb={4}>
                  <FormLabel>Date Range</FormLabel>
                  <Select defaultValue="last30">
                    <option value="last7">Last 7 days</option>
                    <option value="last30">Last 30 days</option>
                    <option value="last90">Last 90 days</option>
                    <option value="ytd">Year to date</option>
                    <option value="custom">Custom range</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Start Date</FormLabel>
                  <Input type="date" />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>End Date</FormLabel>
                  <Input type="date" />
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={4}>
                  Additional Filters
                </Heading>

                <FormControl mb={4}>
                  <FormLabel>Tier</FormLabel>
                  <Select defaultValue="all">
                    <option value="all">All Tiers</option>
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                    <option value="4">Diamond</option>
                    <option value="5">Platinum</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Status</FormLabel>
                  <Select defaultValue="all">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Wallet Address (Optional)</FormLabel>
                  <Input placeholder="Enter wallet address" />
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={4}>
                  Output Format
                </Heading>
                <RadioGroup defaultValue="csv">
                  <Stack direction="row" spacing={5}>
                    <Radio value="csv">CSV</Radio>
                    <Radio value="json">JSON</Radio>
                    <Radio value="pdf">PDF</Radio>
                    <Radio value="excel">Excel</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Alert status="info" borderRadius="md">
                <HStack>
                  <Icon as={FiInfo} />
                  <Box>
                    <Text fontWeight="medium">Report Generation</Text>
                    <Text fontSize="sm">
                      Large reports may take several minutes to generate. You
                      will receive a notification when your report is ready.
                    </Text>
                  </Box>
                </HStack>
              </Alert>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" leftIcon={<FiDownload />}>
              Generate Report
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* User Management Drawer */}
      <Drawer
        isOpen={isOpenWallet} // This would be controlled by a state variable
        placement="right"
        onClose={onCloseWallet} // This would call a function to close the drawer
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Wallet Management</DrawerHeader>

          <DrawerBody>
            <InputGroup mb={6}>
              <InputLeftAddon>
                <FiSearch />
              </InputLeftAddon>
              <Input placeholder="Search by wallet address or nickname..." />
              <InputRightElement width="auto" pr={2}>
                <Button size="sm" colorScheme="blue">
                  Search
                </Button>
              </InputRightElement>
            </InputGroup>

            <Tabs>
              <TabList>
                <Tab>Active Wallets</Tab>
                <Tab>Whitelisted</Tab>
                <Tab>Blacklisted</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0} pt={4}>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Wallet Address</Th>
                        <Th>Nickname</Th>
                        <Th>Total Staked</Th>
                        <Th>Active Since</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* Sample data rows would go here */}
                      <Tr>
                        <Td fontFamily="mono">0x1234...5678</Td>
                        <Td>Diamond Holder 1</Td>
                        <Td isNumeric>12,000,000 KTTY</Td>
                        <Td>2025-02-01</Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="View details"
                              icon={<FiSearch />}
                              size="xs"
                              variant="ghost"
                            />
                            <IconButton
                              aria-label="Edit"
                              icon={<FiEdit2 />}
                              size="xs"
                              variant="ghost"
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<FiMoreVertical />}
                                size="xs"
                                variant="ghost"
                              />
                              <MenuList>
                                <MenuItem icon={<FiLock />}>Blacklist</MenuItem>
                                <MenuItem icon={<FiFlag />}>
                                  Flag for Review
                                </MenuItem>
                                <MenuItem icon={<FiMessageSquare />}>
                                  Send Message
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                      {/* More rows would follow */}
                    </Tbody>
                  </Table>

                  <Flex justify="space-between" align="center" mt={4}>
                    <Text fontSize="sm">Showing 1-10 of 234 wallets</Text>
                    <HStack>
                      <Button size="sm" leftIcon={<FiChevronLeft />} isDisabled>
                        Previous
                      </Button>
                      <Button size="sm" rightIcon={<FiChevronRight />}>
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                </TabPanel>

                {/* Other tab panels would go here */}
                <TabPanel>
                  <Text>Whitelisted wallets content</Text>
                </TabPanel>
                <TabPanel>
                  <Text>Blacklisted wallets content</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Quick Action Menu - Fixed at bottom right */}
      <Box position="fixed" bottom="24px" right="24px" zIndex={100}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Quick actions"
            icon={<FiPlus />}
            colorScheme="blue"
            boxShadow="lg"
            size="lg"
            borderRadius="full"
          />
          <MenuList>
            <MenuItem onClick={onOpenReports} icon={<FiDownload />}>
              Generate Report
            </MenuItem>
            <MenuItem icon={<FiAlertTriangle />}>Emergency Pause</MenuItem>
            <MenuItem onClick={onOpenWallet} icon={<FiLock />}>
              Lock/Unlock Withdrawals
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Notification Toast - This would be controlled by a state/context */}
      {/* Example of how it would look when visible */}
      <Box
        position="fixed"
        bottom="24px"
        left="24px"
        zIndex={100}
        display="none" // This would be controlled by state
      >
        <Box
          bg={useColorModeValue("white", "gray.800")}
          color={textColor}
          borderRadius="md"
          boxShadow="lg"
          p={4}
          minW="300px"
          borderLeftWidth="4px"
          borderLeftColor="green.500"
        >
          <HStack align="flex-start">
            <Icon as={FiCheck} color="green.500" boxSize={5} mt={1} />
            <Box>
              <Text fontWeight="bold">Success</Text>
              <Text fontSize="sm">
                Tier changes have been saved and synced to the blockchain.
              </Text>
            </Box>
            <IconButton
              aria-label="Close"
              icon={<FiX />}
              size="sm"
              variant="ghost"
              ml="auto"
            />
          </HStack>
        </Box>
      </Box>

      {/* Add New Token Modal */}
      <Modal isOpen={isAddTokenOpen} onClose={() => setIsAddTokenOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Reward Token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {tokenError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text>{tokenError}</Text>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Token Symbol</FormLabel>
                <Input
                  placeholder="e.g. BTC"
                  value={newToken.symbol}
                  onChange={(e) =>
                    setNewToken({ ...newToken, symbol: e.target.value })
                  }
                  maxLength={10}
                />
                <FormHelperText>
                  Short identifier for the token (max 10 characters)
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Token Address</FormLabel>
                <Input
                  placeholder="e.g. 0x1234567890abcdef..."
                  value={newToken.address}
                  onChange={(e) =>
                    setNewToken({ ...newToken, address: e.target.value })
                  }
                />
                <FormHelperText>Token contract address</FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsAddTokenOpen(false)}
            >
              Cancel
            </Button>
            <Button
              isLoading={addingToken}
              colorScheme="green"
              onClick={handleAddToken}
              isDisabled={!isConnected || !walletClient}
            >
              Add Token
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AdminDashboard;
