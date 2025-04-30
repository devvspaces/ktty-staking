// pages/staking.js
import { useState, useEffect } from 'react';
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
  Icon} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FiMoon, 
  FiSun, 
  FiClock, 
  FiLock, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiAward, 
  FiRefreshCw,
  FiUsers,
  FiCopy,
  FiArrowRight} from 'react-icons/fi';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineChartBar, 
  HiOutlineClock, 
  HiOutlineFire,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { keyframes } from '@emotion/react';

// Framer Motion animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Shimmer animation
const shimmer = keyframes`
  0% { background-position: -80vw 0; }
  100% { background-position: 80vw 0; }
`;

// Tier data
const stakingTiers = [
  { 
    id: 1, 
    name: "Tier 1", 
    range: "1M - 2.9M $KTTY", 
    lockup: "30 days", 
    rewards: "0.2% fixed in $KTTY",
    color: "#3182CE",
    badges: ["Entry Level"]
  },
  { 
    id: 2, 
    name: "Tier 2", 
    range: "3M - 5.9M $KTTY", 
    lockup: "60 days", 
    rewards: "0.4% fixed in $KTTY + $ZEE",
    color: "#38A169",
    badges: ["Intermediate"]
  },
  { 
    id: 3, 
    name: "Tier 3", 
    range: "6M+ $KTTY", 
    lockup: "90 days", 
    rewards: "1% fixed in $KTTY + $ZEE + KEV-AI + $REAL + $PAW",
    color: "#DD6B20",
    badges: ["Advanced"]
  },
  { 
    id: 4, 
    name: "Diamond", 
    range: "10M+ $KTTY", 
    lockup: "90 Days", 
    rewards: "1.5% fixed APR",
    color: "#319795",
    badges: ["Premium", "Diamond"]
  },
  { 
    id: 5, 
    name: "Platinum", 
    range: "20M+ $KTTY", 
    lockup: "180+ Days", 
    rewards: "2.5% fixed APR",
    color: "#805AD5",
    badges: ["Elite", "Platinum"]
  }
];

// Bonus data
const bonusRewards = [
  {
    name: "Stacking Boost",
    description: "Restake your rewards and increase your APR by +0.01% each cycle (up to a max cap).",
    icon: FiRefreshCw
  },
  {
    name: "180 Days Milestone",
    description: "Stake for 180 days (2 cycles of 90 days) and get an extra 2% $KTTY bonus.",
    icon: FiClock
  },
  {
    name: "360 Days Milestone",
    description: "Stake for 360 days (4 cycles of 90 days) and get an extra 5% $KTTY bonus.",
    icon: FiAward
  },
  {
    name: "Referral Rewards",
    description: "Invite friends to stake & earn a one-time 0.1% bonus in $KTTY based on their stake.",
    icon: FiUsers
  }
];

const StakingDashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');
  
  const [selectedTier, setSelectedTier] = useState<typeof stakingTiers[number] | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [lockupPeriod, setLockupPeriod] = useState(30);
  const [activeRewards, setActiveRewards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Mock user data
  const [userData, setUserData] = useState({
    walletBalance: 2500000,
    stakedAmount: 1000000,
    rewards: {
      ktty: 2000,
      zee: 500,
      kevAi: 100,
      real: 200,
      paw: 150
    },
    stakingHistory: [
      { id: 1, amount: 1000000, lockupPeriod: 30, startDate: '2025-03-15', endDate: '2025-04-14', tier: 1, status: 'active' }
    ],
    referrals: 3,
    referralRewards: 1500,
    stakingStreak: 45
  });

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  // Set active rewards based on the staking amount and lockup period
  useEffect(() => {
    if (stakeAmount && lockupPeriod) {
      const amount = parseFloat(stakeAmount.replace(/,/g, ''));
      let tier = 1;
      let rewards = ['$KTTY'];
      
      if (amount >= 1000000 && amount < 3000000) {
        tier = 1;
        rewards = ['$KTTY'];
      } else if (amount >= 3000000 && amount < 6000000) {
        tier = 2;
        rewards = ['$KTTY', '$ZEE'];
      } else if (amount >= 6000000 && amount < 10000000) {
        tier = 3;
        rewards = ['$KTTY', '$ZEE', 'KEV-AI', '$REAL', '$PAW'];
      } else if (amount >= 10000000 && amount < 20000000) {
        tier = 4;
        rewards = ['$KTTY'];
      } else if (amount >= 20000000) {
        tier = 5;
        rewards = ['$KTTY'];
      }
      
      setSelectedTier(stakingTiers[tier - 1]);
      setActiveRewards(rewards);
    }
  }, [stakeAmount, lockupPeriod]);

  // Format numbers
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate APR
  const calculateAPR = () => {
    if (!stakeAmount) return 0;
    const amount = parseFloat(stakeAmount.replace(/,/g, ''));
    
    if (amount >= 20000000 && lockupPeriod >= 180) return 2.5;
    if (amount >= 10000000 && lockupPeriod >= 90) return 1.5;
    if (amount >= 6000000 && lockupPeriod >= 90) return 1.0;
    if (amount >= 3000000 && lockupPeriod >= 60) return 0.4;
    if (amount >= 1000000 && lockupPeriod >= 30) return 0.2;
    
    return 0;
  };

  // Calculate expected rewards
  const calculateExpectedRewards = () => {
    if (!stakeAmount) return 0;
    const amount = parseFloat(stakeAmount.replace(/,/g, ''));
    const apr = calculateAPR();
    return (amount * apr / 100) * (lockupPeriod / 365);
  };

  // Generate referral link
  const [referralLink, setReferralLink] = useState('https://ktty.finance/stake?ref=YOUR_WALLET');

  // Copy referral link
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    // Could add a toast notification here
  };

  // Lock-up period options based on selected amount
  const getLockupOptions = () => {
    const amount = parseFloat(stakeAmount?.replace(/,/g, '') || '0');
    
    if (amount >= 20000000) return [30, 60, 90, 180, 360];
    if (amount >= 10000000) return [30, 60, 90, 180];
    if (amount >= 6000000) return [30, 60, 90];
    if (amount >= 3000000) return [30, 60];
    return [30];
  };

  // Get the right tier based on amount and lockup
  const getTierFromAmount = (amount: number) => {
    if (amount >= 20000000) return 5;
    if (amount >= 10000000) return 4;
    if (amount >= 6000000) return 3;
    if (amount >= 3000000) return 2;
    if (amount >= 1000000) return 1;
    return 0;
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const bgWG = useColorModeValue("white", "gray.600");
  const bgWG7 = useColorModeValue("white", "gray.700");

  return (
    <Container maxW="1400px" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HStack spacing={3}>
            <Icon as={HiOutlineRocketLaunch} w={8} h={8} color={accentColor} />
            <Heading as="h1" size="xl" color={textColor}>KTTY Staking</Heading>
          </HStack>
        </MotionBox>

        <HStack>
          <Button 
            onClick={toggleColorMode} 
            variant="ghost" 
            rounded="full" 
            size="md"
            aria-label="Toggle color mode"
          >
            {colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </Button>
          <Button 
            colorScheme="blue" 
            leftIcon={<HiOutlineLightningBolt />}
            rounded="full"
            size="md"
          >
            Connect Wallet
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
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
              <Heading size="md" mb={4} color={textColor}>Your Stats</Heading>
              
              {isLoading ? (
                <VStack spacing={4} align="stretch">
                  {[1, 2, 3].map((i) => (
                    <Box 
                      key={i}
                      h="20px" 
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
                        backgroundImage: `linear-gradient(to right, transparent, ${colorMode === 'light' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(45, 55, 72, 0.7)'}, transparent)`,
                        backgroundSize: "80vw 100%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "-80vw 0",
                        animation: `${shimmer} 1.5s infinite`
                      }}
                    />
                  ))}
                </VStack>
              ) : (
                <VStack spacing={4} align="stretch">
                  <Stat bg={statBg} p={3} borderRadius="lg">
                    <StatLabel>Wallet Balance</StatLabel>
                    <HStack>
                      <StatNumber>{formatNumber(userData.walletBalance)} KTTY</StatNumber>
                      <Tooltip label="Available for staking">
                        <Icon as={FiAlertCircle} color="gray.500" />
                      </Tooltip>
                    </HStack>
                  </Stat>
                  
                  <Stat bg={statBg} p={3} borderRadius="lg">
                    <StatLabel>Total Staked</StatLabel>
                    <StatNumber>{formatNumber(userData.stakedAmount)} KTTY</StatNumber>
                    <StatHelpText>
                      <HStack>
                        <Icon as={FiTrendingUp} />
                        <Text>Tier {getTierFromAmount(userData.stakedAmount)}</Text>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                  
                  <Stat bg={statBg} p={3} borderRadius="lg">
                    <StatLabel>Rewards Earned</StatLabel>
                    <StatNumber>{formatNumber(userData.rewards.ktty)} KTTY</StatNumber>
                    <StatHelpText>
                      <HStack wrap="wrap" spacing={2}>
                        {userData.rewards.zee > 0 && (
                          <Badge colorScheme="green">{userData.rewards.zee} ZEE</Badge>
                        )}
                        {userData.rewards.kevAi > 0 && (
                          <Badge colorScheme="purple">{userData.rewards.kevAi} KEV-AI</Badge>
                        )}
                        {userData.rewards.real > 0 && (
                          <Badge colorScheme="blue">{userData.rewards.real} REAL</Badge>
                        )}
                        {userData.rewards.paw > 0 && (
                          <Badge colorScheme="orange">{userData.rewards.paw} PAW</Badge>
                        )}
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </VStack>
              )}
            </MotionBox>

            {/* Rewards Card */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <Heading size="md" mb={4} color={textColor}>Referral Program</Heading>
              
              {isLoading ? (
                <Box 
                  h="100px" 
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
                    backgroundImage: `linear-gradient(to right, transparent, ${colorMode === 'light' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(45, 55, 72, 0.7)'}, transparent)`,
                    backgroundSize: "80vw 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "-80vw 0",
                    animation: `${shimmer} 1.5s infinite`
                  }}
                />
              ) : (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text>Total Referrals</Text>
                    <Text fontWeight="bold">{userData.referrals}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Rewards Earned</Text>
                    <Text fontWeight="bold">{formatNumber(userData.referralRewards)} KTTY</Text>
                  </HStack>
                  
                  <InputGroup size="md">
                    <Input 
                      value={referralLink} 
                      isReadOnly 
                      pr="4.5rem"
                      bg={bgWG}
                    />
                    <InputRightElement width="4.5rem">
                      <Button 
                        h="1.75rem" 
                        size="sm" 
                        onClick={copyReferralLink}
                        leftIcon={<FiCopy />}
                      >
                        Copy
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  
                  <Text fontSize="sm" color="gray.500">
                    Earn 0.1% of friends&apos; stake in KTTY + bonus ZEE for 3+ month stakes!
                  </Text>
                </VStack>
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
              <Heading size="md" mb={4} color={textColor}>Stake KTTY Tokens</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="medium">Amount to Stake</Text>
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
                        onClick={() => setStakeAmount(userData.walletBalance.toString())}
                      >
                        Max
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <HStack mt={2} justify="space-between">
                    <Text fontSize="sm" color="gray.500">Min: 1,000,000 KTTY</Text>
                    <Text fontSize="sm" color="gray.500">
                      Balance: {formatNumber(userData.walletBalance)} KTTY
                    </Text>
                  </HStack>
                </Box>
                
                <Box>
                  <Text mb={2} fontWeight="medium">Lock-up Period</Text>
                  <Select
                    size="lg"
                    value={lockupPeriod}
                    onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                    bg={bgWG}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
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
                  <Text mb={2} fontWeight="medium">Potential Rewards</Text>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={FiTrendingUp} color={accentColor} />
                      <Text>APR</Text>
                    </HStack>
                    <Text fontWeight="bold">{calculateAPR()}%</Text>
                  </HStack>
                  
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={HiOutlineCurrencyDollar} color={accentColor} />
                      <Text>Est. Rewards</Text>
                    </HStack>
                    <Text fontWeight="bold">
                      {formatNumber(Math.floor(calculateExpectedRewards()))} KTTY
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
                          colorScheme={
                            token === '$KTTY' ? 'blue' : 
                            token === '$ZEE' ? 'green' : 
                            token === 'KEV-AI' ? 'purple' : 
                            token === '$REAL' ? 'cyan' : 
                            token === '$PAW' ? 'orange' : 'gray'
                          }
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
                    isDisabled={!stakeAmount || parseFloat(stakeAmount.replace(/,/g, '')) < 1000000}
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
              <Heading size="md" mb={4} color={textColor}>Staking Tiers</Heading>
              
              <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                <TabList mb={4} overflowX="auto" css={{
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)'),
                    borderRadius: '3px',
                  }
                }}>
                  {stakingTiers.map((tier) => (
                    <Tab key={tier.id} _selected={{ color: 'white', bg: tier.color }}>
                      {tier.name}
                    </Tab>
                  ))}
                </TabList>
                
                <TabPanels>
                  {stakingTiers.map((tier) => (
                    <TabPanel key={tier.id} p={0}>
                      <Box
                        p={4}
                        bg={`${tier.color}10`}
                        borderRadius="lg"
                        border="1px"
                        borderColor={`${tier.color}30`}
                      >
                        <HStack mb={3} spacing={2}>
                          {tier.badges.map((badge, index) => (
                            <Badge key={index} colorScheme={tier.color.replace('#', '')} variant="solid">
                              {badge}
                            </Badge>
                          ))}
                        </HStack>
                        
                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mb={3}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Requirement</Text>
                            <HStack>
                              <Icon as={HiOutlineChartBar} color={tier.color} />
                              <Text fontWeight="medium">{tier.range}</Text>
                            </HStack>
                          </Box>
                          
                          <Box>
                            <Text fontSize="sm" color="gray.500">Lock-up Period</Text>
                            <HStack>
                              <Icon as={HiOutlineClock} color={tier.color} />
                              <Text fontWeight="medium">{tier.lockup}</Text>
                            </HStack>
                          </Box>
                        </Grid>
                        
                        <Box mb={4}>
                          <Text fontSize="sm" color="gray.500">Rewards</Text>
                          <HStack>
                            <Icon as={HiOutlineFire} color={tier.color} />
                            <Text fontWeight="medium">{tier.rewards}</Text>
                          </HStack>
                        </Box>
                        
                        <Button 
                          colorScheme={tier.color.replace('#', '')} 
                          variant="outline"
                          rightIcon={<FiArrowRight />}
                          onClick={() => {
                            // Set the minimum stake amount for this tier
                            if (tier.id === 1) setStakeAmount('1000000');
                            if (tier.id === 2) setStakeAmount('3000000');
                            if (tier.id === 3) setStakeAmount('6000000');
                            if (tier.id === 4) setStakeAmount('10000000');
                            if (tier.id === 5) setStakeAmount('20000000');
                            
                            // Set the appropriate lockup period
                            if (tier.id === 1) setLockupPeriod(30);
                            if (tier.id === 2) setLockupPeriod(60);
                            if (tier.id === 3) setLockupPeriod(90);
                            if (tier.id === 4) setLockupPeriod(90);
                            if (tier.id === 5) setLockupPeriod(180);
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
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
            >
              <Heading size="md" mb={4} color={textColor}>Bonus Rewards</Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                {bonusRewards.map((bonus, index) => (
                  <Box 
                    key={index}
                    p={4}
                    bg={bgWG7}
                    borderRadius="lg"
                    border="1px"
                    borderColor={borderColor}
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  >
                    <HStack mb={2}>
                      <Icon 
                        as={bonus.icon} 
                        color={accentColor} 
                        w={5} 
                        h={5} 
                      />
                      <Text fontWeight="bold">{bonus.name}</Text>
                    </HStack>
                    <Text fontSize="sm">{bonus.description}</Text>
                  </Box>
                ))}
              </Grid>
            </MotionBox>
            
            {/* Flash Events */}
            <MotionBox
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              variants={itemVariants}
              position="relative"
              overflow="hidden"
            >
              <Box 
                position="absolute" 
                top={0} 
                right={0} 
                bg="yellow.400" 
                color="black" 
                py={1} 
                px={4} 
                borderBottomLeftRadius="md"
                fontWeight="bold"
                fontSize="sm"
              >
                ACTIVE NOW
              </Box>
              
              <HStack mb={4}>
                <Icon as={HiOutlineLightningBolt} w={6} h={6} color="yellow.400" />
                <Heading size="md" color={textColor}>Special Events</Heading>
              </HStack>
              
              <Box 
                p={4} 
                bg={useColorModeValue("yellow.50", "yellow.900")} 
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue("yellow.100", "yellow.700")}
                mb={4}
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold">24h APR Boost</Text>
                  <Badge colorScheme="yellow">+0.5% APR</Badge>
                </HStack>
                
                <Text fontSize="sm" mb={3}>
                  Limited-time offer! Stake now to receive an additional 0.5% APR on any tier for the next 24 hours.
                </Text>
                
                <HStack>
                  <Icon as={HiOutlineClock} />
                  <Text fontSize="sm">Ends in: 13h 42m 18s</Text>
                </HStack>
              </Box>
              
              <Box 
                p={4} 
                bg={useColorModeValue("purple.50", "purple.900")} 
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue("purple.100", "purple.700")}
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold">Mystery NFT Challenge</Text>
                  <Badge colorScheme="purple">Limited Edition</Badge>
                </HStack>
                
                <Text fontSize="sm" mb={3}>
                  Stake 5M+ KTTY for at least 90 days and receive a limited edition Mystery NFT when the lock-up period ends.
                </Text>
                
                <HStack>
                  <Icon as={HiOutlineClock} />
                  <Text fontSize="sm">Offer valid for: 5 days</Text>
                </HStack>
              </Box>
            </MotionBox>
          </MotionFlex>
        </GridItem>
      </Grid>
      
      {/* Staking Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent
          bg={bgColor}
          borderRadius="xl"
          boxShadow="xl"
        >
          <ModalHeader>Confirm Staking</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">Amount</Text>
                <Heading size="md">{stakeAmount ? formatNumber(parseFloat(stakeAmount.replace(/,/g, ''))) : '0'} KTTY</Heading>
              </Box>
              
              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">Lock-up Period</Text>
                <Heading size="md">{lockupPeriod} Days</Heading>
                <Text fontSize="sm" color="gray.500">Ends on: {new Date(Date.now() + lockupPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
              </Box>
              
              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">Selected Tier</Text>
                <Heading size="md">{selectedTier ? selectedTier.name : 'Tier 1'}</Heading>
                <HStack mt={1} spacing={1}>
                  {activeRewards.map((token, index) => (
                    <Badge 
                      key={index} 
                      colorScheme={
                        token === '$KTTY' ? 'blue' : 
                        token === '$ZEE' ? 'green' : 
                        token === 'KEV-AI' ? 'purple' : 
                        token === '$REAL' ? 'cyan' : 
                        token === '$PAW' ? 'orange' : 'gray'
                      }
                    >
                      {token}
                    </Badge>
                  ))}
                </HStack>
              </Box>
              
              <Box p={4} bg={cardBg} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">Expected APR</Text>
                <Heading size="md">{calculateAPR()}%</Heading>
                <Text fontSize="sm" color="gray.500">Est. {formatNumber(Math.floor(calculateExpectedRewards()))} KTTY in rewards</Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              leftIcon={<FiLock />}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              Confirm Stake
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default StakingDashboard;