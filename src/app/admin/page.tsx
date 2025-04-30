"use client";

import React, { useState } from "react";
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
  StatHelpText,
  StatArrow,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Progress,
  Avatar,
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
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiMoon,
  FiSun,
  FiLogOut,
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

// Define types
type TierType = {
  id: number;
  name: string;
  range: string;
  minStake: number;
  lockup: number;
  apy: number;
  rewards: string[];
  isActive: boolean;
};

type StakeType = {
  id: string;
  walletAddress: string;
  amount: number;
  tier: number;
  tierName: string;
  startDate: string;
  endDate: string;
  rewards: {
    ktty: number;
    zee?: number;
    kevAi?: number;
    real?: number;
    paw?: number;
  };
  status: "active" | "completed" | "withdrawn";
};

type TokenBalanceType = {
  symbol: string;
  name: string;
  balance: number;
  required: number;
  color: string;
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

const AdminDashboard: React.FC = () => {
  // Chakra hooks
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isOpenSetting, onOpen: onOpenSettings, onClose: onCloseSettings } = useDisclosure();
  const { isOpen: isOpenReports, onOpen: onOpenReports, onClose: onCloseReports } = useDisclosure();
  const { isOpen: isOpenWallet, onOpen: onOpenWallet, onClose: onCloseWallet } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Mock data
  const [tiers, setTiers] = useState<TierType[]>([
    {
      id: 1,
      name: "Tier 1",
      range: "1M - 2.9M $KTTY",
      minStake: 1000000,
      lockup: 30,
      apy: 0.2,
      rewards: ["KTTY"],
      isActive: true,
    },
    {
      id: 2,
      name: "Tier 2",
      range: "3M - 5.9M $KTTY",
      minStake: 3000000,
      lockup: 60,
      apy: 0.4,
      rewards: ["KTTY", "ZEE"],
      isActive: true,
    },
    {
      id: 3,
      name: "Tier 3",
      range: "6M+ $KTTY",
      minStake: 6000000,
      lockup: 90,
      apy: 1.0,
      rewards: ["KTTY", "ZEE", "KEV-AI", "REAL", "PAW"],
      isActive: true,
    },
    {
      id: 4,
      name: "Diamond",
      range: "10M+ $KTTY",
      minStake: 10000000,
      lockup: 90,
      apy: 1.5,
      rewards: ["KTTY"],
      isActive: true,
    },
    {
      id: 5,
      name: "Platinum",
      range: "20M+ $KTTY",
      minStake: 20000000,
      lockup: 180,
      apy: 2.5,
      rewards: ["KTTY"],
      isActive: true,
    },
  ]);

  // Mock stakes data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stakes, setStakes] = useState<StakeType[]>([
    {
      id: "stake-001",
      walletAddress: "0x1234...5678",
      amount: 1500000,
      tier: 1,
      tierName: "Tier 1",
      startDate: "2025-03-15",
      endDate: "2025-04-14",
      rewards: {
        ktty: 250,
      },
      status: "active",
    },
    {
      id: "stake-002",
      walletAddress: "0xabcd...efgh",
      amount: 4000000,
      tier: 2,
      tierName: "Tier 2",
      startDate: "2025-03-10",
      endDate: "2025-05-09",
      rewards: {
        ktty: 2666,
        zee: 1333,
      },
      status: "active",
    },
    {
      id: "stake-003",
      walletAddress: "0x7890...1234",
      amount: 8000000,
      tier: 3,
      tierName: "Tier 3",
      startDate: "2025-02-20",
      endDate: "2025-05-21",
      rewards: {
        ktty: 13333,
        zee: 6666,
        kevAi: 2000,
        real: 4000,
        paw: 3000,
      },
      status: "active",
    },
    {
      id: "stake-004",
      walletAddress: "0x5678...9012",
      amount: 12000000,
      tier: 4,
      tierName: "Diamond",
      startDate: "2025-02-01",
      endDate: "2025-05-02",
      rewards: {
        ktty: 30000,
      },
      status: "active",
    },
    {
      id: "stake-005",
      walletAddress: "0xefgh...ijkl",
      amount: 25000000,
      tier: 5,
      tierName: "Platinum",
      startDate: "2025-01-15",
      endDate: "2025-07-14",
      rewards: {
        ktty: 104166,
      },
      status: "active",
    },
    {
      id: "stake-006",
      walletAddress: "0x2468...1357",
      amount: 2000000,
      tier: 1,
      tierName: "Tier 1",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      rewards: {
        ktty: 333,
      },
      status: "completed",
    },
    {
      id: "stake-007",
      walletAddress: "0x1357...2468",
      amount: 5000000,
      tier: 2,
      tierName: "Tier 2",
      startDate: "2024-12-15",
      endDate: "2025-02-13",
      rewards: {
        ktty: 3333,
        zee: 1666,
      },
      status: "completed",
    },
  ]);

  // Token balances
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceType[]>([
    {
      symbol: "KTTY",
      name: "Kitty Token",
      balance: 5000000,
      required: 4000000,
      color: "blue",
    },
    {
      symbol: "ZEE",
      name: "Zee Token",
      balance: 150000,
      required: 120000,
      color: "green",
    },
    {
      symbol: "KEV-AI",
      name: "Kevin AI Token",
      balance: 20000,
      required: 35000,
      color: "purple",
    },
    {
      symbol: "REAL",
      name: "Real Token",
      balance: 45000,
      required: 40000,
      color: "cyan",
    },
    {
      symbol: "PAW",
      name: "Paw Token",
      balance: 30000,
      required: 28000,
      color: "orange",
    },
  ]);

  // For tier edit
  const [editingTier, setEditingTier] = useState<TierType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Filter states for analytics
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Token addition state
  const [isAddTokenOpen, setIsAddTokenOpen] = useState<boolean>(false);
  const [newToken, setNewToken] = useState<{
    symbol: string;
    name: string;
    balance: number;
    required: number;
    color: string;
  }>({
    symbol: "",
    name: "",
    balance: 0,
    required: 0,
    color: "blue",
  });
  const [tokenError, setTokenError] = useState<string>("");

  // Add new token functions
  const validateNewToken = () => {
    if (!newToken.symbol.trim()) {
      setTokenError("Token symbol is required");
      return false;
    }

    if (!newToken.name.trim()) {
      setTokenError("Token name is required");
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

  const handleAddToken = () => {
    if (validateNewToken()) {
      const tokenToAdd = {
        ...newToken,
        symbol: newToken.symbol.trim().toUpperCase(),
        name: newToken.name.trim(),
      };

      setTokenBalances([...tokenBalances, tokenToAdd]);
      setIsAddTokenOpen(false);
      setNewToken({
        symbol: "",
        name: "",
        balance: 0,
        required: 0,
        color: "blue",
      });
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

  // Dashboard analytics
  const totalStaked = stakes
    .filter((stake) => stake.status === "active")
    .reduce((sum, stake) => sum + stake.amount, 0);

  const totalRewards = stakes.reduce(
    (sum, stake) => sum + stake.rewards.ktty,
    0
  );

  const activeStakes = stakes.filter(
    (stake) => stake.status === "active"
  ).length;
  const completedStakes = stakes.filter(
    (stake) => stake.status === "completed"
  ).length;

  // Get filtered stakes
  const getFilteredStakes = () => {
    return stakes.filter((stake) => {
      const matchesStatus =
        statusFilter === "all" || stake.status === statusFilter;
      const matchesTier =
        tierFilter === "all" || stake.tier === parseInt(tierFilter);
      const matchesSearch =
        searchTerm === "" ||
        stake.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stake.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesTier && matchesSearch;
    });
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle tier edit
  const handleEditTier = (tier: TierType) => {
    setEditingTier({ ...tier });
    setIsEditDialogOpen(true);
  };

  // Save tier changes
  const saveTierChanges = () => {
    if (editingTier) {
      setTiers(
        tiers.map((tier) => (tier.id === editingTier.id ? editingTier : tier))
      );
      setIsEditDialogOpen(false);
      setEditingTier(null);
    }
  };

  // Toggle tier reward token
  const toggleTierReward = (tokenSymbol: string) => {
    if (editingTier) {
      const updatedRewards = editingTier.rewards.includes(tokenSymbol)
        ? editingTier.rewards.filter((reward) => reward !== tokenSymbol)
        : [...editingTier.rewards, tokenSymbol];

      setEditingTier({
        ...editingTier,
        rewards: updatedRewards,
      });
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

  // Execute token action
  const executeTokenAction = () => {
    if (tokenActionDialog.token && tokenAmount > 0) {
      const updatedBalances = tokenBalances.map((token) => {
        if (token.symbol === tokenActionDialog.token?.symbol) {
          const newBalance =
            tokenActionDialog.type === "deposit"
              ? token.balance + tokenAmount
              : token.balance - tokenAmount;

          return {
            ...token,
            balance: newBalance < 0 ? 0 : newBalance,
          };
        }
        return token;
      });

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

  return (
    <Flex h="100vh">
      {/* Main Content */}
      <Box
        flex="1"
        overflow="auto"
        bg={useColorModeValue("gray.50", "gray.900")}
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
        >
          <Text
            fontWeight="bold"
            fontSize="lg"
            display={{ base: "block", md: "none" }}
          >
            KTTY Admin
          </Text>

          <HStack spacing={3}>
            <Tooltip label={colorMode === "light" ? "Dark Mode" : "Light Mode"}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                variant="ghost"
                onClick={toggleColorMode}
                size="md"
              />
            </Tooltip>

            <Avatar size="sm" name="Admin User" bg="blue.500" color="white" />

            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<FiChevronDown />}
              >
                Admin
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onOpenSettings} icon={<FiSettings size={18} />}>Settings</MenuItem>
                <MenuItem icon={<FiLogOut size={18} />}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Container maxW="1600px" py={6} px={{ base: 4, md: 6 }}>
          {/* Admin Tabs */}
          <Tabs variant="line" colorScheme="blue" isLazy>
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
              <Tab fontWeight="medium" px={5} whiteSpace={'nowrap'}>
                Dashboard
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={'nowrap'}>
                Tier Management
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={'nowrap'}>
                Analytics
              </Tab>
              <Tab fontWeight="medium" px={5} whiteSpace={'nowrap'}>
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
                      <Heading size="lg" mb={6}>
                        Dashboard Overview
                      </Heading>
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
                            {formatNumber(totalStaked)} KTTY
                          </Heading>
                          <Text mt={2} color="gray.500">
                            Across {activeStakes} active stakes
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
                          <Heading size="lg">{activeStakes}</Heading>
                          <HStack mt={2}>
                            <Text color="gray.500">
                              Completed: {completedStakes}
                            </Text>
                            <Text color="gray.500">
                              Total: {activeStakes + completedStakes}
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
                            {formatNumber(totalRewards)} KTTY
                          </Heading>
                          <Text mt={2} color="gray.500">
                            +{formatNumber(Math.floor(totalRewards * 0.1))}{" "}
                            other tokens
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Low Balance Warning */}
                    <GridItem as={MotionBox} variants={fadeIn}>
                      <Card bg={bgR5R9} borderColor="red.200" borderWidth="1px">
                        <CardBody>
                          <HStack mb={2}>
                            <Icon
                              as={FiAlertTriangle}
                              color="red.500"
                              boxSize={5}
                            />
                            <Text>Low Balance Warning</Text>
                          </HStack>
                          <Heading size="lg">KEV-AI Token</Heading>
                          <HStack mt={2}>
                            <Text
                              color={useColorModeValue("red.600", "red.300")}
                            >
                              Current: {formatNumber(20000)}
                            </Text>
                            <Text
                              color={useColorModeValue("red.600", "red.300")}
                            >
                              Required: {formatNumber(35000)}
                            </Text>
                          </HStack>
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
                            <Button
                              size="sm"
                              variant="ghost"
                              rightIcon={<FiChevronDown />}
                            >
                              View All
                            </Button>
                          </HStack>
                        </CardHeader>
                        <CardBody maxW={{
                          base: "calc(100vw - 42px)",
                          md: 'none'
                        }} overflowX={'scroll'}>
                          <Table variant="simple" size="sm">
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
                              {stakes.slice(0, 5).map((stake) => (
                                <Tr key={stake.id}>
                                  <Td>{stake.walletAddress}</Td>
                                  <Td>{formatNumber(stake.amount)} KTTY</Td>
                                  <Td>
                                    <Badge
                                      colorScheme={
                                        stake.tier === 5
                                          ? "purple"
                                          : stake.tier === 4
                                          ? "teal"
                                          : stake.tier === 3
                                          ? "orange"
                                          : stake.tier === 2
                                          ? "green"
                                          : "blue"
                                      }
                                    >
                                      {stake.tierName}
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
                              ))}
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
                        <CardBody>
                          {tiers.map((tier) => {
                            const tierStakes = stakes.filter(
                              (s) => s.tier === tier.id && s.status === "active"
                            );
                            const totalInTier = tierStakes.reduce(
                              (sum, stake) => sum + stake.amount,
                              0
                            );
                            const percentage =
                              totalStaked > 0
                                ? (totalInTier / totalStaked) * 100
                                : 0;

                            return (
                              <Box key={tier.id} mb={4}>
                                <Flex justify="space-between" mb={1}>
                                  <Text fontWeight="medium">{tier.name}</Text>
                                  <Text>
                                    {formatNumber(totalInTier)} KTTY (
                                    {percentage.toFixed(1)}%)
                                  </Text>
                                </Flex>
                                <Progress
                                  value={percentage}
                                  size="sm"
                                  borderRadius="full"
                                  colorScheme={
                                    tier.id === 5
                                      ? "purple"
                                      : tier.id === 4
                                      ? "teal"
                                      : tier.id === 3
                                      ? "orange"
                                      : tier.id === 2
                                      ? "green"
                                      : "blue"
                                  }
                                />
                              </Box>
                            );
                          })}
                        </CardBody>
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
                                      onClick={() =>
                                        openTokenAction("deposit", token)
                                      }
                                    />
                                    <IconButton
                                      aria-label="Withdraw"
                                      icon={<FiMinus />}
                                      size="xs"
                                      colorScheme="red"
                                      isDisabled={token.balance <= 0}
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
                            <HStack justify="space-between">
                              <Text>Smart Contract Balance</Text>
                              <Tag colorScheme="blue">5.23 ETH</Tag>
                            </HStack>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiSettings />}
                              variant="outline"
                              alignSelf="flex-start"
                            >
                              Advanced Settings
                            </Button>
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
                  <Flex justify="space-between" align="center" mb={6} gap={3} wrap={'wrap'}>
                    <Heading size="lg">Tier Management</Heading>
                    <HStack>
                      <Button
                        leftIcon={<FiDownload />}
                        variant="outline"
                        size="sm"
                      >
                        Export
                      </Button>
                      <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        size="sm"
                      >
                        Sync with Blockchain
                      </Button>
                    </HStack>
                  </Flex>

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
                      const tierStakes = stakes.filter(
                        (s) => s.tier === tier.id && s.status === "active"
                      );
                      const totalInTier = tierStakes.reduce(
                        (sum, stake) => sum + stake.amount,
                        0
                      );

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
                                  <Switch
                                    isChecked={tier.isActive}
                                    colorScheme="green"
                                    onChange={() => {
                                      const updatedTiers = tiers.map((t) =>
                                        t.id === tier.id
                                          ? { ...t, isActive: !t.isActive }
                                          : t
                                      );
                                      setTiers(updatedTiers);
                                    }}
                                  />
                                  <IconButton
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
                                    {formatNumber(tier.minStake)} KTTY
                                  </Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">Lockup Period</Text>
                                  <Text>{tier.lockup} days</Text>
                                </Flex>
                                <Flex justify="space-between">
                                  <Text fontWeight="medium">APY</Text>
                                  <Text fontWeight="bold" color="green.500">
                                    {(tier.apy * 100).toFixed(1)}%
                                  </Text>
                                </Flex>
                                <Box>
                                  <Text fontWeight="medium" mb={2}>
                                    Reward Tokens
                                  </Text>
                                  <HStack spacing={2} flexWrap="wrap">
                                    {tier.rewards.map((reward) => (
                                      <Tag
                                        key={reward}
                                        colorScheme={
                                          reward === "KTTY"
                                            ? "blue"
                                            : reward === "ZEE"
                                            ? "green"
                                            : reward === "KEV-AI"
                                            ? "purple"
                                            : reward === "REAL"
                                            ? "cyan"
                                            : "orange"
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
                                      {tierStakes.length}
                                    </Text>
                                  </HStack>
                                  <HStack justify="space-between">
                                    <Text fontSize="sm">Total Staked:</Text>
                                    <Text fontSize="sm">
                                      {formatNumber(totalInTier)} KTTY
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
                  <Flex justify="space-between" align="center" mb={6} gap={3} wrap={'wrap'}>
                    <Heading size="lg">Staking Analytics</Heading>
                    <HStack wrap={'wrap'}>
                      <Select
                        width="150px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="withdrawn">Withdrawn</option>
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
                            <StatNumber>{activeStakes}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              {Math.floor(Math.random() * 10 + 5)}% since last
                              month
                            </StatHelpText>
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
                            <StatNumber>{completedStakes}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              {Math.floor(Math.random() * 5 + 2)}% since last
                              month
                            </StatHelpText>
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
                              {formatNumber(totalStaked)} KTTY
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              {Math.floor(Math.random() * 15 + 10)}% since last
                              month
                            </StatHelpText>
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
                              {formatNumber(totalRewards)} KTTY
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              {Math.floor(Math.random() * 8 + 6)}% since last
                              month
                            </StatHelpText>
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
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {getFilteredStakes().map((stake) => (
                            <Tr key={stake.id}>
                              <Td fontFamily="mono">{stake.id}</Td>
                              <Td fontFamily="mono">{stake.walletAddress}</Td>
                              <Td isNumeric>
                                {formatNumber(stake.amount)} KTTY
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    stake.tier === 5
                                      ? "purple"
                                      : stake.tier === 4
                                      ? "teal"
                                      : stake.tier === 3
                                      ? "orange"
                                      : stake.tier === 2
                                      ? "green"
                                      : "blue"
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
                                    <MenuItem>
                                      KTTY: {formatNumber(stake.rewards.ktty)}
                                    </MenuItem>
                                    {stake.rewards.zee && (
                                      <MenuItem>
                                        ZEE: {formatNumber(stake.rewards.zee)}
                                      </MenuItem>
                                    )}
                                    {stake.rewards.kevAi && (
                                      <MenuItem>
                                        KEV-AI:{" "}
                                        {formatNumber(stake.rewards.kevAi)}
                                      </MenuItem>
                                    )}
                                    {stake.rewards.real && (
                                      <MenuItem>
                                        REAL: {formatNumber(stake.rewards.real)}
                                      </MenuItem>
                                    )}
                                    {stake.rewards.paw && (
                                      <MenuItem>
                                        PAW: {formatNumber(stake.rewards.paw)}
                                      </MenuItem>
                                    )}
                                  </MenuList>
                                </Menu>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    stake.status === "active"
                                      ? "green"
                                      : stake.status === "completed"
                                      ? "blue"
                                      : "gray"
                                  }
                                >
                                  {stake.status}
                                </Badge>
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
                                    aria-label="Export"
                                    icon={<FiDownload />}
                                    size="xs"
                                    variant="ghost"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                    <Flex
                      justify="space-between"
                      align="center"
                      p={4}
                      borderTopWidth="1px"
                    >
                      <Text fontSize="sm">
                        Showing {getFilteredStakes().length} of {stakes.length}{" "}
                        stakes
                      </Text>
                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FiChevronLeft />}
                          isDisabled
                        >
                          Previous
                        </Button>
                        <Button size="sm" rightIcon={<FiChevronRight />}>
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>

                  {/* Advanced Analytics */}
                  <Grid
                    templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
                    gap={6}
                  >
                    {/* Staking Activity Over Time */}
                    <GridItem as={Card}>
                      <CardHeader>
                        <Heading size="md">Staking Activity Over Time</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box
                          h="300px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="gray.500">
                            Chart visualization would go here
                          </Text>
                        </Box>
                      </CardBody>
                    </GridItem>

                    {/* Distribution by Tier Chart */}
                    <GridItem as={Card}>
                      <CardHeader>
                        <Heading size="md">Distribution by Tier</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box
                          h="300px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="gray.500">
                            Pie chart visualization would go here
                          </Text>
                        </Box>
                      </CardBody>
                    </GridItem>
                  </Grid>
                </MotionBox>
              </TabPanel>

              {/* Token Management Tab */}
              <TabPanel p={0}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerAnimation}
                >
                  <Flex justify="space-between" align="center" mb={6} wrap={'wrap'} gap={3}>
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
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Smart Contract Address
                            </Text>
                            <Text fontFamily="mono">
                              0x7a2dF5FEa2dF5eA69f4DF5cC83f8921b1626A63A
                            </Text>
                          </Box>
                          <Button
                            leftIcon={<FiCopy />}
                            size="sm"
                            variant="ghost"
                          >
                            Copy
                          </Button>
                        </Flex>
                        <Divider my={4} />
                        <Flex justify="space-between" mb={4}>
                          <Text fontWeight="bold">Native Balance</Text>
                          <Text>5.23 ETH</Text>
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
                              {formatNumber(token.required)} needed (
                              {((token.balance / token.required) * 100).toFixed(
                                1
                              )}
                              % available)
                            </Text>
                          </HStack>
                        ))}
                      </CardBody>
                    </GridItem>
                  </Grid>

                  {/* Token Details */}
                  <Grid templateColumns={{ base: "1fr" }} gap={6}>
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
                            <Grid
                              templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                              gap={6}
                            >
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
                              <Box>
                                <Text fontWeight="medium" mb={2}>
                                  Transaction History
                                </Text>
                                <VStack
                                  align="stretch"
                                  spacing={2}
                                  maxH="200px"
                                  overflowY="auto"
                                >
                                  <Flex
                                    justify="space-between"
                                    p={2}
                                    bg={cardBg}
                                    borderRadius="md"
                                  >
                                    <HStack>
                                      <Tag colorScheme="green" size="sm">
                                        Deposit
                                      </Tag>
                                      <Text fontSize="sm">+10,000</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">
                                      2025-04-28
                                    </Text>
                                  </Flex>
                                  <Flex
                                    justify="space-between"
                                    p={2}
                                    bg={cardBg}
                                    borderRadius="md"
                                  >
                                    <HStack>
                                      <Tag colorScheme="red" size="sm">
                                        Withdraw
                                      </Tag>
                                      <Text fontSize="sm">-5,000</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">
                                      2025-04-25
                                    </Text>
                                  </Flex>
                                  <Flex
                                    justify="space-between"
                                    p={2}
                                    bg={cardBg}
                                    borderRadius="md"
                                  >
                                    <HStack>
                                      <Tag colorScheme="green" size="sm">
                                        Deposit
                                      </Tag>
                                      <Text fontSize="sm">+20,000</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">
                                      2025-04-20
                                    </Text>
                                  </Flex>
                                </VStack>
                                <Button
                                  leftIcon={<FiDownload />}
                                  variant="outline"
                                  size="sm"
                                  mt={4}
                                  w="full"
                                >
                                  Export History
                                </Button>
                              </Box>
                            </Grid>
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
                    <FormLabel>Range Description</FormLabel>
                    <Input
                      value={editingTier.range}
                      onChange={(e) =>
                        setEditingTier({
                          ...editingTier,
                          range: e.target.value,
                        })
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
                      value={editingTier.apy * 100}
                      onChange={(valueString) => {
                        const value = parseFloat(valueString);
                        setEditingTier({
                          ...editingTier,
                          apy: isNaN(value) ? 0 : value / 100,
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
                      {["KTTY", "ZEE", "KEV-AI", "REAL", "PAW"].map((token) => (
                        <Button
                          key={token}
                          size="sm"
                          colorScheme={
                            editingTier.rewards.includes(token)
                              ? token === "KTTY"
                                ? "blue"
                                : token === "ZEE"
                                ? "green"
                                : token === "KEV-AI"
                                ? "purple"
                                : token === "REAL"
                                ? "cyan"
                                : "orange"
                              : "gray"
                          }
                          leftIcon={
                            editingTier.rewards.includes(token) ? (
                              <FiCheck />
                            ) : undefined
                          }
                          onClick={() => toggleTierReward(token)}
                          mb={2}
                        >
                          {token}
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
              <Button colorScheme="blue" onClick={saveTierChanges} ml={3}>
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
                    <Input
                      value="0x7a2dF5FEa2dF5eA69f4DF5cC83f8921b1626A63A"
                      isReadOnly
                    />
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
                  <FormLabel>Admin Wallet Address</FormLabel>
                  <InputGroup>
                    <Input
                      value="0x8b3aD7EFd5E50C87E586B2e91f8b7D12b9B021a7"
                      isReadOnly
                    />
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
            <MenuItem icon={<FiRefreshCw />}>Sync with Blockchain</MenuItem>
            <MenuItem onClick={onOpenReports} icon={<FiDownload />}>Generate Report</MenuItem>
            <MenuItem icon={<FiAlertTriangle />}>Emergency Pause</MenuItem>
            <MenuItem onClick={onOpenWallet} icon={<FiLock />}>Lock/Unlock Withdrawals</MenuItem>
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
                <FormLabel>Token Name</FormLabel>
                <Input
                  placeholder="e.g. Bitcoin"
                  value={newToken.name}
                  onChange={(e) =>
                    setNewToken({ ...newToken, name: e.target.value })
                  }
                />
                <FormHelperText>Full name of the token</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Initial Balance</FormLabel>
                <NumberInput
                  value={newToken.balance}
                  onChange={(valueString) => {
                    const value = parseInt(valueString);
                    setNewToken({
                      ...newToken,
                      balance: isNaN(value) ? 0 : value,
                    });
                  }}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Current balance of this token in the contract
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Required Amount</FormLabel>
                <NumberInput
                  value={newToken.required}
                  onChange={(valueString) => {
                    const value = parseInt(valueString);
                    setNewToken({
                      ...newToken,
                      required: isNaN(value) ? 0 : value,
                    });
                  }}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Minimum amount needed for reward distribution
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Color Scheme</FormLabel>
                <Select
                  value={newToken.color}
                  onChange={(e) =>
                    setNewToken({ ...newToken, color: e.target.value })
                  }
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="cyan">Cyan</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                  <option value="teal">Teal</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                </Select>
                <FormHelperText>
                  Visual color associated with this token
                </FormHelperText>
              </FormControl>

              <Box w="full">
                <Text fontWeight="medium" mb={2}>
                  Preview
                </Text>
                <HStack>
                  <Tag
                    size="md"
                    colorScheme={newToken.color}
                    borderRadius="full"
                    px={3}
                  >
                    <TagLabel>{newToken.symbol || "TOKEN"}</TagLabel>
                  </Tag>
                  <Text>{newToken.name || "Token Name"}</Text>
                </HStack>
              </Box>
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
            <Button colorScheme="green" onClick={handleAddToken}>
              Add Token
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AdminDashboard;
