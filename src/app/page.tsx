/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useColorMode,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  Select,
  Icon,
  Image,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiMoon,
  FiSun,
  FiLock,
  FiTrendingUp,
  FiAlertCircle,
  FiArrowRight,
  FiGift,
  FiCheck,
  FiInfo,
  FiMoreVertical,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineGift } from "react-icons/hi";
import {
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { keyframes } from "@emotion/react";
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
} from "viem";
import { saigon, ronin } from "viem/chains";
import moment from "moment";
import { abi } from "@/lib/abi.json";
import { ERC20_ABI } from "@/lib/utils";
import NotActive from "@/components/NotActive";

// Framer Motion animations
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

// Shimmer animation
const shimmer = keyframes`
  0% { background-position: -80vw 0; }
  100% { background-position: 80vw 0; }
`;

// Tier data
type StakingTier = {
  id: number;
  name: string;
  range: string;
  lockup: string;
  rewards: string;
  color: string;
  badges: string[];
  apy: number;
  minStake: number;
  maxStake: number;
  reward_tokens: {
    address: string;
    symbol: string;
  }[];
};

const STAKING_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as string;
const KTTY_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KTTY_TOKEN_ADDRESS as string;
const currentChain =
  (process.env.NEXT_PUBLIC_CHAIN as string) === "ronin" ? ronin : saigon;

// Pulse animation for claim button
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(49, 151, 149, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(49, 151, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(49, 151, 149, 0); }
`;

type StakeStatus = "active" | "ready-to-claim" | "claimed";
type Stake = {
  id: number;
  amount: number;
  lockupPeriod: number;
  startDate: string;
  endDate: string;
  tier: number;
  status: StakeStatus;
  rewards: Record<string, number>;
  progress: number;
};

const StakingDashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const statBg = useColorModeValue("blue.50", "blue.900");

  const [selectedTier, setSelectedTier] = useState<StakingTier | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [lockupPeriod, setLockupPeriod] = useState(30);
  const [activeRewards, setActiveRewards] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [account, setAccount] = useState<string | null>(null);
  const [connector, setConnector] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setWalletClient] = useState<any>(null);
  const [walletDisplay, setWalletDisplay] = useState("");
  const [balances, setBalances] = useState({ ktty: "0" });
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userStakes, setUserStakes] = useState<Stake[]>([]);
  const [loadingUserStakes, setLoadingUserStakes] = useState(false);
  const [activeStakesTab, setActiveStakesTab] = useState(0);
  const [stakingTiers, setStakingTiers] = useState<StakingTier[]>([]);
  const [loadingStakingTiers, setLoadingStakingTiers] = useState(false);

  function formatNumberToHuman(num: number, digits = 1) {
    // Define the suffixes and their corresponding thresholds
    const suffixes = [
      { value: 1e12, symbol: "T" }, // Trillion
      { value: 1e9, symbol: "B" }, // Billion
      { value: 1e6, symbol: "M" }, // Million
      { value: 1e3, symbol: "K" }, // Thousand
    ];

    // Handle 0 or undefined separately
    if (num === 0 || !num) return "0";

    // Handle negative numbers
    const isNegative = num < 0;
    const absNum = Math.abs(num);

    // Find the appropriate suffix
    for (const { value, symbol } of suffixes) {
      if (absNum >= value) {
        // Calculate the formatted value with proper rounding
        let formattedValue = (absNum / value).toFixed(digits);

        // Remove trailing zeros after decimal point
        formattedValue = formattedValue.replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

        // Return the formatted string with the negative sign if needed
        return (isNegative ? "-" : "") + formattedValue + symbol;
      }
    }

    // If number is smaller than 1000, just return it as is
    return num.toString();
  }

  useEffect(() => {
    async function fetchTiers() {
      try {
        setLoadingStakingTiers(true);
        const response = await fetch("/api/get-tiers");
        const data = await response.json();
        const colors = ["#3182CE", "#38A169", "#DD6B20", "#319795", "#805AD5"];
        const tiers: StakingTier[] = data.tiers.map(
          (tier: any, idx: number) => {
            const min_stake = parseFloat(formatEther(BigInt(tier.min_stake)));
            const max_stake = parseFloat(formatEther(BigInt(tier.max_stake)));
            const lockupInDays = tier.lockup_period / (24 * 60 * 60);
            const apy = parseFloat((tier.apy / 100000).toFixed(1));
            let rewardText = "$KTTY";
            if (tier.reward_tokens.length > 0) {
              rewardText =
                rewardText +
                " + " +
                tier.reward_tokens
                  .map((token: any) => token.symbol)
                  .join(" + ");
            }
            let range = `${formatNumberToHuman(
              min_stake
            )} - ${formatNumberToHuman(max_stake)} $KTTY`;
            if (idx === data.tiers.length - 1) {
              range = `${formatNumberToHuman(min_stake)}+ $KTTY`;
            }
            return {
              id: tier.id,
              name: tier.name,
              range,
              lockup: `${lockupInDays} days`,
              apy: apy,
              rewards: `${apy}% fixed in ${rewardText}`,
              color: colors[idx % colors.length],
              badges: [`Tier ${tier.id}`],
              reward_tokens: tier.reward_tokens,
              minStake: min_stake,
              maxStake: max_stake,
            };
          }
        );
        // sort by id
        tiers.sort((a, b) => a.id - b.id);
        setStakingTiers(tiers);
      } finally {
        setLoadingStakingTiers(false);
      }
    }
    fetchTiers();
  }, []);

  // New state for stake details modal
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const {
    isOpen: isStakeDetailsOpen,
    onOpen: onStakeDetailsOpen,
    onClose: onStakeDetailsClose,
  } = useDisclosure();

  // New state for claim rewards modal
  const {
    isOpen: isClaimRewardsOpen,
    onOpen: onClaimRewardsOpen,
    onClose: onClaimRewardsClose,
  } = useDisclosure();

  // Calculate total staked
  const calculateTotalStaked = () => {
    return userStakes.reduce((total, stake) => {
      if (stake.status !== "claimed") {
        return total + stake.amount;
      }
      return total;
    }, 0);
  };

  // Calculate total pending rewards
  const calculateTotalPendingRewards = () => {
    return userStakes.reduce((total, stake) => {
      if (stake.status !== "claimed") {
        return total + (stake.rewards.KTTY ?? 0);
      }
      return total;
    }, 0);
  };

  const calculateOtherPendingRewards = () => {
    return userStakes.reduce((total, stake) => {
      if (stake.status !== "claimed") {
        for (const key of Object.keys(stake.rewards)) {
          if (key !== "KTTY") {
            total[key] = (total[key] || 0) + stake.rewards[key];
          }
        }
      }
      return total;
    }, {} as Record<string, number>);
  };

  const otherPendingRewards = calculateOtherPendingRewards();

  // Calculate total claimed rewards
  const calculateTotalClaimedRewards = () => {
    return userStakes.reduce((total, stake) => {
      if (stake.status === "claimed") {
        return total + (stake.rewards.KTTY ?? 0);
      }
      return total;
    }, 0);
  };

  // Filter stakes based on active tab
  const getFilteredStakes = () => {
    switch (activeStakesTab) {
      case 0: // All
        return userStakes;
      case 1: // Active
        return userStakes.filter((stake) => stake.status === "active");
      case 2: // Ready to Claim
        return userStakes.filter((stake) => stake.status === "ready-to-claim");
      case 3: // Claimed
        return userStakes.filter((stake) => stake.status === "claimed");
      default:
        return userStakes;
    }
  };

  // Format date
  const formatDate = (dateString: string | number | Date) => {
    return moment(dateString).format("MMM D, YYYY");
  };

  // Calculate time remaining for a stake
  const calculateTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Completed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  // Handle stake details view
  const viewStakeDetails = (stakeId: number) => {
    const stake = userStakes.find((s) => s.id === stakeId);
    if (!stake) return;

    setSelectedStake(stake);
    onStakeDetailsOpen();
  };

  // Handle claim rewards
  const handleClaimRewards = (stakeId: number) => {
    // Find the stake
    const stake = userStakes.find((s) => s.id === stakeId);
    if (!stake) return;

    // Set it as the selected stake for the modal
    setSelectedStake(stake);
    onClaimRewardsOpen();
  };

  // Function to confirm and process the claim
  const confirmClaimRewards = async () => {
    if (!selectedStake) return;

    // Stake amount
    const hash2 = await walletClient.writeContract({
      account: account,
      address: STAKING_CONTRACT_ADDRESS,
      abi: abi,
      functionName: "claimRewardsAndWithdraw",
      args: [selectedStake.id],
    });

    toast({
      title: "Claiming rewards",
      description: "Your claim transaction is being processed.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    // Wait for transaction confirmation
    await publicClient.waitForTransactionReceipt({ hash: hash2 });

    toast({
      title: "Claim successful",
      description: `You've successfully claimed rewards for stake #${selectedStake.id}.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Update the stake status in the state
    const updatedStakes = userStakes.map((stake) => {
      if (stake.id === selectedStake.id) {
        return {
          ...stake,
          status: "claimed" as StakeStatus,
        };
      }
      return stake;
    });

    setUserStakes(updatedStakes);
    onClaimRewardsClose();

    toast({
      title: "Rewards Claimed",
      description: `You have successfully claimed rewards for stake #${selectedStake.id}.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

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

        setAccount(account);

        provider.handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            setIsConnected(false);
            setAccount(null);
            setWalletDisplay("");
            setBalances({ ktty: "0" });
            setShowWalletMenu(false);
          } else {
            setAccount(accounts[0]);
          }
        };

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

        await fetchBalances(publicClient, account);
        await fetchStakes(account);

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

  const fetchStakes = async (account: string) => {
    try {
      setLoadingUserStakes(true);
      const response = await fetch(`/api/get-stakes?owner=${account}`);
      const data = await response.json();
      console.log("Fetched stakes:", data);
      setUserStakes(data.stakes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserStakes(false);
    }
  };

  // Add this function to fetch token balances
  const fetchBalances = async (client: any, account: any) => {
    console.log("Fetching balances for account:", account);
    try {
      // Get KTTY balance
      const kttyBalance = await client.readContract({
        address: KTTY_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [account],
      });

      // Format balances
      setBalances({
        ktty: formatEther(kttyBalance),
      });

      // Format address for display (0x1234...5678)
      setWalletDisplay(
        `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
      );
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const [stakeLoading, setStakeLoading] = useState(false);
  const handleConfirmStake = async () => {
    try {
      setStakeLoading(true);

      if (!walletClient || !publicClient) {
        toast({
          title: "Wallet client not initialized",
          description: "Please connect your wallet.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!selectedTier) {
        toast({
          title: "Tier not selected",
          description: "Please select a staking tier.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Approve amount
      console.log("selectedTier", selectedTier);
      console.log("stakeAmount", stakeAmount);
      const amount = BigInt(stakeAmount.replace(/,/g, "")) * BigInt(10 ** 18);
      const hash1 = await walletClient.writeContract({
        account: account,
        address: KTTY_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [STAKING_CONTRACT_ADDRESS, amount],
      });
      toast({
        title: "Approval submitted",
        description: `Approval transaction submitted.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash: hash1 });
      toast({
        title: "Approval successful",
        description: `You've approved KTTY for staking.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Stake amount
      const hash2 = await walletClient.writeContract({
        account: account,
        address: STAKING_CONTRACT_ADDRESS,
        abi: abi,
        functionName: "stake",
        args: [amount, selectedTier.id],
      });

      toast({
        title: "Staking in progress",
        description: "Your staking transaction is being processed.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      toast({
        title: "Staking successful",
        description: `You've successfully staked ${stakeAmount} KTTY.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error(`Error staking:`, error);
      toast({
        title: "Staking failed",
        description: `Failed to stake KTTY.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStakeLoading(false);
    }
  };

  // Add disconnect function
  const handleDisconnect = async () => {
    setAccount(null);
    setIsConnected(false);
    setWalletDisplay("");
    setBalances({ ktty: "0" });
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

  // Mock user data
  const userData = {
    walletBalance: parseFloat(balances.ktty),
    rewards: {
      ktty: 0,
      zee: 0,
      kevAi: 0,
      real: 0,
      paw: 0,
    },
    referrals: 0,
    referralRewards: 0,
  };

  // Set active rewards based on the staking amount and lockup period
  useEffect(() => {
    if (stakeAmount && lockupPeriod) {
      const amount = parseFloat(stakeAmount.replace(/,/g, ""));
      let rewards = ["$KTTY"];

      // Determine the tier based on the amount and lockup period
      for (let i = 0; i < stakingTiers.length; i++) {
        const tierData = stakingTiers[i];
        const min = tierData.minStake;
        const max = tierData.maxStake;
        if (amount >= min && amount <= max) {
          rewards = rewards.concat(
            tierData.reward_tokens.map((token) => token.symbol)
          );
          setSelectedTier(stakingTiers[i]);
          setActiveRewards(rewards);
          return;
        }
      }

      const minTier = stakingTiers[0];
      const maxTier = stakingTiers[stakingTiers.length - 1];

      if (amount < minTier.minStake) {
        setSelectedTier(null);
        setActiveRewards([]);
      } else if (amount > maxTier.maxStake) {
        setSelectedTier(maxTier);
        setActiveRewards(
          rewards.concat(maxTier.reward_tokens.map((token) => token.symbol))
        );
      }
    }
  }, [stakeAmount, lockupPeriod]);

  // Format numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Calculate expected rewards
  const calculateExpectedRewards = () => {
    if (!stakeAmount || !selectedTier) return 0;
    const amount = parseFloat(stakeAmount.replace(/,/g, ""));
    return (amount * selectedTier.apy) / 100;
  };

  // Lock-up period options based on selected amount
  const getLockupOptions = () => {
    return [30, 60, 90, 120, 180, 360];
  };

  // Handle staking process
  const handleStake = () => {
    // This would connect to the wallet and smart contract in a real implementation
    onOpen();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const bgWG = useColorModeValue("white", "gray.600");
  const clr2 = useColorModeValue("gray.100", "gray.700");
  const clr3 = useColorModeValue("gray.200", "gray.600");
  const activeBg = useColorModeValue("green.50", "green.900");
  const claimableBg = useColorModeValue("orange.50", "orange.900");
  const claimedBg = useColorModeValue("gray.100", "gray.600");
  const tokenColors = ["blue", "green", "purple", "cyan", "orange", "gray"];

  return (
    <Container maxW="1400px" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="./logo.png" alt="kttyworld" w={"120px"} />
        </MotionBox>

        <HStack>
          <Button
            onClick={toggleColorMode}
            variant="ghost"
            rounded="full"
            size="md"
            aria-label="Toggle color mode"
          >
            {colorMode === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </Button>

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

                    <Box>
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="sm">KTTY Balance</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {parseFloat(balances.ktty).toLocaleString()}
                        </Text>
                      </HStack>
                    </Box>

                    <Divider />

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

      <Grid
        display={{
          base: "flex",
          md: "grid",
        }}
        flexDirection="column"
        templateColumns={{ base: "1fr", md: "1fr 2fr" }}
        gap={6}
      >
        {/* Left Column: Stats & Rewards */}
        <GridItem>
          <MotionFlex
            direction="column"
            gap={6}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Stats Card */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color={textColor}>
                  Your Stats
                </Heading>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FiRefreshCw />}
                  isLoading={loadingUserStakes}
                  isDisabled={!account}
                  onClick={() => {
                    fetchStakes(account!);
                  }}
                >
                  Refresh
                </Button>
              </HStack>
              <VStack spacing={4} align="stretch">
                <Stat bg={statBg} p={3} borderRadius="lg">
                  <StatLabel>Wallet Balance</StatLabel>
                  <HStack>
                    <StatNumber>{userData.walletBalance} KTTY</StatNumber>
                    <Tooltip label="Available for staking">
                      <Icon as={FiAlertCircle} color="gray.500" />
                    </Tooltip>
                  </HStack>
                </Stat>

                {loadingUserStakes ? (
                  <>
                    <Spinner />
                  </>
                ) : (
                  <>
                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel>Total Staked</StatLabel>
                      <StatNumber>
                        {formatNumber(calculateTotalStaked())} KTTY
                      </StatNumber>
                    </Stat>

                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel>Pending Rewards</StatLabel>
                      <StatNumber>
                        {formatNumber(calculateTotalPendingRewards())} KTTY
                      </StatNumber>
                      <StatHelpText
                        hidden={Object.keys(otherPendingRewards).length === 0}
                      >
                        <HStack wrap="wrap" spacing={2}>
                          {Object.keys(otherPendingRewards).map(
                            (key, index) => {
                              const color =
                                tokenColors[index % tokenColors.length];
                              return (
                                <Badge key={key} colorScheme={color}>
                                  {otherPendingRewards[key]} {key}
                                </Badge>
                              );
                            }
                          )}
                        </HStack>
                      </StatHelpText>
                      {userStakes.some(
                        (stake) => stake.status === "ready-to-claim"
                      ) && (
                        <StatHelpText>
                          <Badge
                            colorScheme="orange"
                            variant="solid"
                            px={2}
                            py={1}
                          >
                            Rewards Ready to Claim
                          </Badge>
                        </StatHelpText>
                      )}
                    </Stat>

                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel>Rewards Earned</StatLabel>
                      <StatNumber>
                        {formatNumber(calculateTotalClaimedRewards())} KTTY
                      </StatNumber>
                      <StatHelpText>
                        <HStack wrap="wrap" spacing={2}>
                          {userData.rewards.zee > 0 && (
                            <Badge colorScheme="green">
                              {userData.rewards.zee} ZEE
                            </Badge>
                          )}
                          {userData.rewards.kevAi > 0 && (
                            <Badge colorScheme="purple">
                              {userData.rewards.kevAi} KEV-AI
                            </Badge>
                          )}
                          {userData.rewards.real > 0 && (
                            <Badge colorScheme="blue">
                              {userData.rewards.real} REAL
                            </Badge>
                          )}
                          {userData.rewards.paw > 0 && (
                            <Badge colorScheme="orange">
                              {userData.rewards.paw} PAW
                            </Badge>
                          )}
                        </HStack>
                      </StatHelpText>
                    </Stat>
                  </>
                )}
              </VStack>
            </MotionBox>

            {/* Rewards Card */}
            <Box
              rounded={"xl"}
              overflow={"hidden"}
              position={"relative"}
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
            >
              <Image
                src={"/short.jpg"}
                alt=""
                w={"100%"}
                h={"100%"}
                objectFit={"cover"}
              />
            </Box>

            {/* Your Stakes Card */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <Heading size="md" mb={4} color={textColor}>
                Your Stakes
              </Heading>

              {loadingUserStakes ? (
                <VStack spacing={4} align="stretch">
                  {[1, 2].map((i) => (
                    <Box
                      key={i}
                      h="60px"
                      bg="gray.200"
                      _dark={{ bg: "gray.600" }}
                      borderRadius="md"
                      position="relative"
                      overflow="hidden"
                      _after={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundImage: `linear-gradient(to right, transparent, ${
                          colorMode === "light"
                            ? "rgba(226, 232, 240, 0.7)"
                            : "rgba(45, 55, 72, 0.7)"
                        }, transparent)`,
                        backgroundSize: "80vw 100%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "-80vw 0",
                        animation: `${shimmer} 1.5s infinite`,
                      }}
                    />
                  ))}
                </VStack>
              ) : userStakes.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  <Tabs
                    variant="soft-rounded"
                    colorScheme="blue"
                    size="sm"
                    onChange={(index) => setActiveStakesTab(index)}
                  >
                    <TabList mb={3}>
                      <Tab>All ({userStakes.length})</Tab>
                      <Tab>
                        Active (
                        {userStakes.filter((s) => s.status === "active").length}
                        )
                      </Tab>
                      <Tab>
                        Claimable (
                        {
                          userStakes.filter(
                            (s) => s.status === "ready-to-claim"
                          ).length
                        }
                        )
                      </Tab>
                      <Tab>
                        Claimed (
                        {
                          userStakes.filter((s) => s.status === "claimed")
                            .length
                        }
                        )
                      </Tab>
                    </TabList>
                    <TabPanels p={0}>
                      {[0, 1, 2, 3].map((tabIndex) => (
                        <TabPanel key={tabIndex} p={0}>
                          <VStack spacing={3} align="stretch">
                            {getFilteredStakes().length > 0 ? (
                              getFilteredStakes().map((stake) => (
                                <Box
                                  key={stake.id}
                                  p={3}
                                  borderRadius="lg"
                                  bg={
                                    stake.status === "ready-to-claim"
                                      ? claimableBg
                                      : stake.status === "claimed"
                                      ? claimedBg
                                      : activeBg
                                  }
                                  borderWidth="1px"
                                  borderColor={
                                    stake.status === "ready-to-claim"
                                      ? "orange.200"
                                      : stake.status === "claimed"
                                      ? "gray.300"
                                      : "green.200"
                                  }
                                  _dark={{
                                    borderColor:
                                      stake.status === "ready-to-claim"
                                        ? "orange.600"
                                        : stake.status === "claimed"
                                        ? "gray.600"
                                        : "green.600",
                                  }}
                                  position="relative"
                                  transition="all 0.2s"
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "md",
                                  }}
                                >
                                  <Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <VStack align="start" spacing={0}>
                                      <HStack>
                                        <Text fontWeight="bold">
                                          {formatNumber(stake.amount)} KTTY
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            stake.status === "ready-to-claim"
                                              ? "orange"
                                              : stake.status === "claimed"
                                              ? "gray"
                                              : "green"
                                          }
                                        >
                                          {stake.status === "ready-to-claim"
                                            ? "Ready to Claim"
                                            : stake.status === "claimed"
                                            ? "Claimed"
                                            : "Active"}
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="sm">
                                        Tier {stake.tier} • {stake.lockupPeriod}{" "}
                                        days
                                      </Text>
                                    </VStack>
                                    <HStack>
                                      {stake.status === "ready-to-claim" ? (
                                        <Button
                                          size="sm"
                                          colorScheme="orange"
                                          leftIcon={<FiGift />}
                                          onClick={() =>
                                            handleClaimRewards(stake.id)
                                          }
                                          css={{
                                            animation: `${pulse} 2s infinite`,
                                          }}
                                        >
                                          Claim
                                        </Button>
                                      ) : stake.status === "active" ? (
                                        <Text
                                          fontSize="sm"
                                          fontWeight="medium"
                                          color={
                                            colorMode === "light"
                                              ? "green.600"
                                              : "green.300"
                                          }
                                        >
                                          {calculateTimeRemaining(
                                            stake.endDate
                                          )}
                                        </Text>
                                      ) : (
                                        <Icon
                                          as={FiCheck}
                                          color="gray.500"
                                          boxSize={5}
                                        />
                                      )}
                                      <Menu>
                                        <MenuButton
                                          as={Button}
                                          variant="ghost"
                                          size="sm"
                                          aria-label="Options"
                                        >
                                          <FiMoreVertical />
                                        </MenuButton>
                                        <MenuList>
                                          <MenuItem
                                            icon={<FiInfo />}
                                            onClick={() =>
                                              viewStakeDetails(stake.id)
                                            }
                                          >
                                            View Details
                                          </MenuItem>
                                          {stake.status ===
                                            "ready-to-claim" && (
                                            <MenuItem
                                              icon={<FiGift />}
                                              onClick={() =>
                                                handleClaimRewards(stake.id)
                                              }
                                            >
                                              Claim Rewards
                                            </MenuItem>
                                          )}
                                          <MenuDivider />
                                          <MenuItem
                                            icon={<FiExternalLink />}
                                            isDisabled
                                          >
                                            View on Explorer
                                          </MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </HStack>
                                  </Flex>
                                  <Progress
                                    value={stake.progress}
                                    size="xs"
                                    colorScheme={
                                      stake.status === "ready-to-claim"
                                        ? "orange"
                                        : stake.status === "claimed"
                                        ? "gray"
                                        : "green"
                                    }
                                    borderRadius="full"
                                    mt={2}
                                  />
                                </Box>
                              ))
                            ) : (
                              <Box
                                p={4}
                                textAlign="center"
                                bg={bgWG}
                                borderRadius="lg"
                              >
                                <Text>No stakes found in this category.</Text>
                              </Box>
                            )}
                          </VStack>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </VStack>
              ) : (
                <Box
                  p={6}
                  textAlign="center"
                  bg={bgWG}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderStyle="dashed"
                >
                  <VStack spacing={4}>
                    <Icon as={FiLock} boxSize={8} color="gray.400" />
                    <Text>
                      You don&apos;t have any active stakes yet. Start staking
                      to earn rewards!
                    </Text>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<HiOutlineLightningBolt />}
                    >
                      Stake Now
                    </Button>
                  </VStack>
                </Box>
              )}
            </MotionBox>
          </MotionFlex>
        </GridItem>

        {/* Right Column: Staking Form & Tiers */}
        <GridItem>
          <MotionFlex
            direction="column"
            gap={6}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Staking Form */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <Heading size="md" mb={4} color={textColor}>
                Stake KTTY Tokens
              </Heading>

              <VStack spacing={6} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Amount to Stake
                  </Text>
                  <InputGroup size="lg">
                    <Input
                      placeholder="Enter amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      bg={bgWG}
                      borderColor={borderColor}
                      _focus={{ borderColor: accentColor }}
                      type="text"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        colorScheme="blue"
                        onClick={() =>
                          setStakeAmount(userData.walletBalance.toString())
                        }
                      >
                        Max
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <HStack mt={2} justify="space-between">
                    <Text fontSize="sm" color="gray.500">
                      Min: 1,000,000 KTTY
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Balance: {userData.walletBalance} KTTY
                    </Text>
                  </HStack>
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Lock-up Period
                  </Text>
                  <Select
                    size="lg"
                    value={lockupPeriod}
                    onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                    bg={bgWG}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                    isDisabled={true}
                  >
                    {getLockupOptions().map((days) => (
                      <option key={days} value={days}>
                        {days} Days
                      </option>
                    ))}
                  </Select>
                </Box>

                <Divider />

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Potential Rewards
                  </Text>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={FiTrendingUp} color={accentColor} />
                      <Text>APR</Text>
                    </HStack>
                    <Text fontWeight="bold">{selectedTier?.apy ?? 0}%</Text>
                  </HStack>

                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={HiOutlineCurrencyDollar} color={accentColor} />
                      <Text>Est. Rewards</Text>
                    </HStack>
                    <Text fontWeight="bold">
                      {calculateExpectedRewards().toLocaleString()} each
                    </Text>
                  </HStack>

                  <HStack justify="space-between" mb={4}>
                    <HStack>
                      <Icon as={HiOutlineFire} color={accentColor} />
                      <Text>Reward Tokens</Text>
                    </HStack>
                    <HStack spacing={1}>
                      {activeRewards.map((token, index) => (
                        <Badge
                          key={index}
                          colorScheme={tokenColors[index % tokenColors.length]}
                        >
                          {token}
                        </Badge>
                      ))}
                    </HStack>
                  </HStack>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isDisabled={
                      !stakeAmount ||
                      parseFloat(stakeAmount.replace(/,/g, "")) <
                        stakingTiers[0].minStake ||
                      parseFloat(stakeAmount.replace(/,/g, "")) >
                        userData.walletBalance ||
                      !isConnected
                    }
                    onClick={handleStake}
                    leftIcon={<FiLock />}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Stake Now
                  </Button>
                </Box>
              </VStack>
            </MotionBox>

            {/* Tier Info */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <Heading size="md" mb={4} color={textColor}>
                Staking Tiers
              </Heading>

              <Spinner hidden={!loadingStakingTiers} />

              <Tabs
                hidden={loadingStakingTiers}
                variant="soft-rounded"
                colorScheme="blue"
                isLazy
              >
                <TabList
                  mb={4}
                  overflowX="auto"
                  css={{
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": {
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: useColorModeValue(
                        "rgba(0, 0, 0, 0.2)",
                        "rgba(255, 255, 255, 0.2)"
                      ),
                      borderRadius: "3px",
                    },
                  }}
                >
                  {stakingTiers.map((tier) => (
                    <Tab
                      key={tier.id}
                      _selected={{ color: "white", bg: tier.color }}
                      whiteSpace={"nowrap"}
                    >
                      {tier.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {stakingTiers.map((tier) => (
                    <TabPanel key={tier.id} p={0}>
                      <Box
                        p={4}
                        bg={
                          colorMode === "light"
                            ? `${tier.color}10`
                            : `${tier.color}30`
                        }
                        borderRadius="lg"
                        border="1px"
                        borderColor={
                          colorMode === "light"
                            ? `${tier.color}30`
                            : `${tier.color}50`
                        }
                      >
                        <HStack mb={3} spacing={2}>
                          {tier.badges.map((badge, index) => (
                            <Badge
                              key={index}
                              colorScheme={tier.color.replace("#", "")}
                              variant="solid"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </HStack>

                        <Grid
                          templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                          gap={4}
                          mb={3}
                        >
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Requirement
                            </Text>
                            <HStack>
                              <Icon as={HiOutlineChartBar} color={tier.color} />
                              <Text fontWeight="medium">{tier.range}</Text>
                            </HStack>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Lock-up Period
                            </Text>
                            <HStack>
                              <Icon as={HiOutlineClock} color={tier.color} />
                              <Text fontWeight="medium">{tier.lockup}</Text>
                            </HStack>
                          </Box>
                        </Grid>

                        <Box mb={4}>
                          <Text fontSize="sm" color="gray.500">
                            Rewards
                          </Text>
                          <HStack>
                            <Icon as={HiOutlineFire} color={tier.color} />
                            <Text fontWeight="medium">{tier.rewards}</Text>
                          </HStack>
                        </Box>

                        <Button
                          colorScheme={tier.color.replace("#", "")}
                          variant="outline"
                          rightIcon={<FiArrowRight />}
                          onClick={() => {
                            // Set the minimum stake amount for this tier
                            setStakeAmount(tier.minStake.toString());
                            setLockupPeriod(parseInt(tier.lockup));
                          }}
                        >
                          Stake at this tier
                        </Button>
                      </Box>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </MotionBox>

            {/* Bonus Info */}
            <Box
              rounded={"xl"}
              overflow={"hidden"}
              position={"relative"}
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
            >
              <NotActive>
                <Image
                  src={"/long.jpg"}
                  alt=""
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </NotActive>
            </Box>
          </MotionFlex>
        </GridItem>
      </Grid>

      {/* Staking Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl">
          <ModalHeader>Confirm Staking</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Amount
                </Text>
                <Heading size="md">
                  {stakeAmount
                    ? formatNumber(parseFloat(stakeAmount.replace(/,/g, "")))
                    : "0"}{" "}
                  KTTY
                </Heading>
              </Box>

              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Lock-up Period
                </Text>
                <Heading size="md">{lockupPeriod} Days</Heading>
                <Text fontSize="sm" color="gray.500">
                  Ends on:{" "}
                  {moment(
                    new Date(Date.now() + lockupPeriod * 24 * 60 * 60 * 1000)
                  ).format("MMMM Do YYYY")}
                </Text>
              </Box>

              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Selected Tier
                </Text>
                <Heading size="md">
                  {selectedTier ? selectedTier.name : "Tier 1"}
                </Heading>
                <HStack mt={1} spacing={1}>
                  {activeRewards.map((token, index) => (
                    <Badge
                      key={index}
                      colorScheme={tokenColors[index % tokenColors.length]}
                    >
                      {token}
                    </Badge>
                  ))}
                </HStack>
              </Box>

              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Expected APR
                </Text>
                <Heading size="md">{selectedTier?.apy ?? 0}%</Heading>
                <Text fontSize="sm" color="gray.500">
                  Est. {calculateExpectedRewards().toLocaleString()} each in
                  rewards
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStake}
              colorScheme="blue"
              leftIcon={<FiLock />}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
              isLoading={stakeLoading}
            >
              Confirm Stake
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Stake Details Modal */}
      <Modal
        isOpen={isStakeDetailsOpen}
        onClose={onStakeDetailsClose}
        isCentered
        size="md"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl">
          <ModalHeader>Stake Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedStake && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={cardBg} borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">
                    Stake ID
                  </Text>
                  <Heading size="md">#{selectedStake.id}</Heading>
                  <Badge
                    mt={2}
                    colorScheme={
                      selectedStake.status === "ready-to-claim"
                        ? "orange"
                        : selectedStake.status === "claimed"
                        ? "gray"
                        : "green"
                    }
                  >
                    {selectedStake.status === "ready-to-claim"
                      ? "Ready to Claim"
                      : selectedStake.status === "claimed"
                      ? "Claimed"
                      : "Active"}
                  </Badge>
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box p={4} bg={cardBg} borderRadius="lg">
                    <Text fontSize="sm" color="gray.500">
                      Amount
                    </Text>
                    <Heading size="md">
                      {formatNumber(selectedStake.amount)} KTTY
                    </Heading>
                  </Box>

                  <Box p={4} bg={cardBg} borderRadius="lg">
                    <Text fontSize="sm" color="gray.500">
                      Tier
                    </Text>
                    <Heading size="md">Tier {selectedStake.tier}</Heading>
                  </Box>
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box p={4} bg={cardBg} borderRadius="lg">
                    <Text fontSize="sm" color="gray.500">
                      Start Date
                    </Text>
                    <Text fontWeight="bold">
                      {formatDate(selectedStake.startDate)}
                    </Text>
                  </Box>

                  <Box p={4} bg={cardBg} borderRadius="lg">
                    <Text fontSize="sm" color="gray.500">
                      End Date
                    </Text>
                    <Text fontWeight="bold">
                      {formatDate(selectedStake.endDate)}
                    </Text>
                  </Box>
                </Grid>

                <Box p={4} bg={cardBg} borderRadius="lg">
                  <Text fontSize="sm" color="gray.500">
                    Progress
                  </Text>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">
                      {selectedStake.progress}% Complete
                    </Text>
                    {selectedStake.status === "active" && (
                      <Text fontSize="sm">
                        {calculateTimeRemaining(selectedStake.endDate)}{" "}
                        remaining
                      </Text>
                    )}
                  </HStack>
                  <Progress
                    value={selectedStake.progress}
                    colorScheme={
                      selectedStake.status === "ready-to-claim"
                        ? "orange"
                        : selectedStake.status === "claimed"
                        ? "gray"
                        : "green"
                    }
                    borderRadius="full"
                    size="sm"
                  />
                </Box>

                <Box p={4} bg={cardBg} borderRadius="lg">
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    Rewards
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {Object.keys(selectedStake.rewards).map((key) => {
                      const value = selectedStake.rewards[key];
                      if (value > 0) {
                        return (
                          <HStack key={key} justify="space-between">
                            <Text>{key}</Text>
                            <Text fontWeight="bold">
                              {value.toLocaleString()}
                            </Text>
                          </HStack>
                        );
                      }
                    })}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onStakeDetailsClose}>
              Close
            </Button>
            {selectedStake && selectedStake.status === "ready-to-claim" && (
              <Button
                colorScheme="orange"
                leftIcon={<FiGift />}
                onClick={() => {
                  onStakeDetailsClose();
                  handleClaimRewards(selectedStake.id);
                }}
              >
                Claim Rewards
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Claim Rewards Modal */}
      <Modal
        isOpen={isClaimRewardsOpen}
        onClose={onClaimRewardsClose}
        isCentered
        size="md"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="xl">
          <ModalHeader>Claim Rewards</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedStake && (
              <VStack spacing={4} align="stretch">
                <Box p={6} textAlign="center">
                  <Icon
                    as={HiOutlineGift}
                    boxSize={16}
                    color="orange.400"
                    mb={4}
                    _dark={{ color: "orange.300" }}
                  />
                  <Heading size="md" mb={3}>
                    Your Rewards are Ready!
                  </Heading>
                  <Text>
                    You can now claim the rewards for your stake of{" "}
                    <b>{formatNumber(selectedStake.amount)} KTTY</b>.
                  </Text>
                </Box>

                <Box p={4} bg={cardBg} borderRadius="lg">
                  <Text fontSize="sm" color="gray.500" mb={3}>
                    You will receive:
                  </Text>

                  <VStack align="stretch" spacing={3}>
                    <HStack
                      justify="space-between"
                      p={3}
                      bg={bgWG}
                      borderRadius="md"
                    >
                      <HStack>
                        <Icon as={HiOutlineCurrencyDollar} color="blue.500" />
                        <Text>KTTY</Text>
                      </HStack>
                      <Text fontWeight="bold">
                        {formatNumber(selectedStake.rewards.KTTY ?? 0)}
                      </Text>
                    </HStack>
                    {Object.keys(selectedStake.rewards).map((key, idx) => {
                      const value = selectedStake.rewards[key];
                      const color = tokenColors[idx % tokenColors.length];
                      if (value > 0 && key !== "KTTY") {
                        return (
                          <HStack
                            key={key}
                            justify="space-between"
                            p={3}
                            bg={bgWG}
                            borderRadius="md"
                          >
                            <HStack>
                              <Icon as={HiOutlineFire} color={`${color}.500`} />
                              <Text>{key}</Text>
                            </HStack>
                            <Text fontWeight="bold">{formatNumber(value)}</Text>
                          </HStack>
                        );
                      }
                    })}
                  </VStack>
                </Box>

                <Box
                  p={4}
                  bg="orange.50"
                  _dark={{ bg: "orange.900" }}
                  borderRadius="lg"
                >
                  <HStack>
                    <Icon as={FiInfo} color="orange.500" />
                    <Text fontSize="sm">
                      After claiming, you can choose to restake your rewards for
                      additional APR boost.
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClaimRewardsClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              leftIcon={<HiOutlineGift />}
              onClick={confirmClaimRewards}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              Claim Rewards
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default StakingDashboard;
