/** ======================================================== Imports ======================================================== */

import dotenv from 'dotenv';

import { Balance, Coin, Config, Decimal, Exchange, OrderType } from './types';

import * as BinanceService from './exchanges/binance';
import * as KuCoinService from './exchanges/kuCoin';

dotenv.config();

/** ======================================================== Variables ======================================================== */

export const QUOTE = 'USDT';
const shouldOrder = false;
const orderType: string = OrderType.Sell;

/** Binance Coins */
const RUNE = 'RUNE'; // 1
const BEAM = 'BEAMX';
const PYR = 'PYR';
const SOL = 'SOL'; // 2
const RNDR = 'RNDR';
const SEI = 'SEI';
const MANTA = 'MANTA';
const FET = 'FET';
const GMX = 'GMX';
const SUPER = 'SUPER';
const DYM = 'DYM';
const JUP = 'JUP';
const ARB = 'ARB'; // 3
const ILV = 'ILV';

/** KuCoin Coins */
const PYTH = 'PYTH'; // 1
const SFUND = 'SFUND'; // 2
const NAKA = 'NAKA';
const XCAD = 'XCAD'; // 3
const UOS = 'UOS';
const MYRIA = 'MYRIA';
const SIDUS = 'SIDUS';
const VRA = 'VRA';

const buyConfig: Config = {
  [Exchange.Binance]: [
    { base: RUNE, amount: 625 }, // 1
    { base: BEAM, amount: 625 },
    { base: PYR, amount: 625 },
    { base: SOL, amount: 375 }, // 2
    { base: RNDR, amount: 375 },
    { base: SEI, amount: 375 },
    { base: MANTA, amount: 375 },
    { base: FET, amount: 375 },
    { base: GMX, amount: 375 },
    { base: SUPER, amount: 375 },
    { base: DYM, amount: 375 },
    { base: JUP, amount: 375 },
    { base: ARB, amount: 250 }, // 3
    { base: ILV, amount: 250 },
  ],
  [Exchange.KuCoin]: [
    { base: PYTH, amount: 625 }, // 1
    { base: SFUND, amount: 375 }, // 2
    { base: NAKA, amount: 375 },
    { base: XCAD, amount: 250 }, // 3
    { base: UOS, amount: 250 },
    { base: MYRIA, amount: 250 },
    { base: SIDUS, amount: 250 },
    { base: VRA, amount: 250 },
  ],
};

const sellConfig: Config = {
  [Exchange.Binance]: [
    { base: RUNE, amount: '100%' }, // 1
    { base: BEAM, amount: '100%' },
    { base: PYR, amount: '100%' },
    { base: SOL, amount: '100%' }, // 2
    { base: RNDR, amount: '100%' },
    { base: SEI, amount: '100%' },
    { base: MANTA, amount: '100%' },
    { base: FET, amount: '100%' },
    { base: GMX, amount: '100%' },
    { base: SUPER, amount: '100%' },
    { base: DYM, amount: '100%' },
    { base: JUP, amount: '100%' },
    { base: ARB, amount: '100%' }, // 3
    { base: ILV, amount: '100%' },
  ],
  [Exchange.KuCoin]: [
    { base: PYTH, amount: '100%' }, // 1
    { base: SFUND, amount: '100%' }, // 2
    { base: NAKA, amount: '100%' },
    { base: XCAD, amount: '100%' }, // 3
    { base: UOS, amount: '100%' },
    { base: MYRIA, amount: '100%' },
    { base: SIDUS, amount: '100%' },
    { base: VRA, amount: '100%' },
  ],
};

let binanceCoins: Array<Coin> = [];
let kuCoinCoins: Array<Coin> = [];
let binanceDemicalPositions: Array<Decimal> = [];
let kuCoinDemicalPositions: Array<Decimal> = [];

/** ===================================================== Helper functions ===================================================== */

const getUsableCoins = (exchangeKey: Exchange) => {
  const coins: Array<Coin> = [];

  switch (orderType) {
    case OrderType.Buy:
      coins.push(...(buyConfig[exchangeKey] || []));
      break;

    case OrderType.Sell:
      coins.push(...(sellConfig[exchangeKey] || []));
      break;
  }

  const nonZeroCoins = coins.filter((coin) => {
    if (typeof coin.amount === 'string') {
      const value = getPercentMultiplier(coin.amount);
      return value !== 0;
    }

    return !!coin.amount;
  });

  return nonZeroCoins;
};

const calculateCoinsUsdtAmount = (
  coins: Array<Coin> | undefined,
  totalExchangeBalance: number,
) => {
  if (!coins) {
    return 0;
  }

  return coins.reduce((acc, curr) => {
    if (typeof curr.amount === 'string') {
      const value = parseInt(curr.amount.substring(0, curr.amount.length - 1));
      return acc + totalExchangeBalance * (value / 100);
    }

    return acc + curr.amount;
  }, 0);
};

const getPercentMultiplier = (percentage: string) => {
  return parseInt(percentage.substring(0, percentage.length - 1)) / 100;
};

const getPrice = async (base: string, exchange: Exchange) => {
  switch (exchange) {
    case Exchange.Binance:
      return await BinanceService.getPrice(base);

    case Exchange.KuCoin:
      return await KuCoinService.getPrice(base);
  }
};

const getDecimal = (base: string, exchange: Exchange) => {
  switch (exchange) {
    case Exchange.Binance:
      return (
        binanceDemicalPositions.find(
          (d: Decimal) => d.pair === BinanceService.createPair(base),
        )?.decimal || 0
      );

    case Exchange.KuCoin:
      return (
        kuCoinDemicalPositions.find(
          (d: Decimal) => d.pair === KuCoinService.createPair(base),
        )?.decimal || 0
      );
  }
};

const startOrder = async (
  base: string,
  orderType: OrderType,
  quantity: { base?: number; quote?: number },
  price: number,
  exchange: Exchange,
) => {
  switch (exchange) {
    case Exchange.Binance:
      await BinanceService.startOrder(
        base,
        orderType,
        { quantity: quantity.base, quoteOrderQty: quantity.quote },
        price,
      );
      break;

    case Exchange.KuCoin:
      await KuCoinService.startOrder(
        base,
        orderType,
        { size: quantity.base, funds: quantity.quote },
        price,
      );
      break;
  }
};

/** ======================================================== Functions ======================================================== */

const startBuyOrder = async (
  coin: Coin,
  totalAvailableUsdtBalance: number,
  exchange: Exchange,
) => {
  console.log(`starting BUY order for: ${coin.base}`);

  try {
    const base = coin.base;

    const usdtAmount =
      typeof coin.amount === 'string'
        ? totalAvailableUsdtBalance * getPercentMultiplier(coin.amount)
        : coin.amount;

    const price = await getPrice(base, exchange);

    if (shouldOrder) {
      /** Real order */
      await startOrder(
        base,
        OrderType.Buy,
        { quote: usdtAmount },
        price,
        exchange,
      );

      return;
    }

    const decimal = getDecimal(base, exchange);
    const quantity = parseFloat((usdtAmount / price).toFixed(decimal));
    const totalBalance = parseFloat((quantity * price).toFixed(4));

    /** Fake order */
    console.log('Buy order was successfull!');
    console.log(`Total balance: ${totalBalance} USDT`);
    console.log(`Amount bought: ${quantity} ${base}`);
    console.log(`Price of: ${price} USDT\n`);
  } catch (error) {
    console.error(error);
  }
};

const startSellOrder = async (
  coin: Coin,
  balance: Balance | undefined,
  exchange: Exchange,
) => {
  console.log('starting SELL order for:', coin.base);

  if (!balance && typeof coin.amount === 'string') {
    console.error('Not enough info about the quantity to sell');
    return;
  }

  try {
    const base = coin.base;
    const baseBalance = balance?.balance || 0;

    const baseAmount =
      typeof coin.amount === 'string'
        ? baseBalance * getPercentMultiplier(coin.amount)
        : coin.amount;

    const price = await getPrice(base, exchange);
    const decimal = getDecimal(base, exchange);
    const quantity = parseFloat(baseAmount.toFixed(decimal));

    if (shouldOrder) {
      /** Real order */
      await startOrder(
        base,
        OrderType.Sell,
        { base: quantity },
        price,
        exchange,
      );

      return;
    }

    const totalBalance = parseFloat((quantity * price).toFixed(4));

    /** Fake order */
    console.log('Sell order was successfull!');
    console.log(`Total balance: ${totalBalance} USDT`);
    console.log(`Amount sold: ${quantity} ${base}`);
    console.log(`Price of: ${price} USDT\n`);
  } catch (error) {
    console.error(error);
  }
};

const startBuySequence = async () => {
  /** Determine the usdt balance on binance */
  const binanceUsdtBalance = await BinanceService.getUsdtBalance();

  /** Determine the combined usdt value of binance coins */
  const binanceCoinsTotalBalance = calculateCoinsUsdtAmount(
    buyConfig.binance,
    binanceUsdtBalance,
  );

  /** Determine the usdt balance on kuCoin */
  const kuCoinUsdtBalance = await KuCoinService.getUsdtBalance();

  /** Determine the combined usdt value of kuCoin coins */
  const kuCoinCoinsTotalBalance = calculateCoinsUsdtAmount(
    buyConfig.kuCoin,
    kuCoinUsdtBalance,
  );

  /** Check if the amount of usdt needed is lower than we have available */
  if (
    binanceCoinsTotalBalance > binanceUsdtBalance ||
    kuCoinCoinsTotalBalance > kuCoinUsdtBalance
  ) {
    console.error('NOT ENOUGH BALANCE TO CONTINUE.');
    return;
  }

  /** For each coin, we want to start a buy order  */

  /** BINANCE */
  for (const coin of binanceCoins) {
    await startBuyOrder(coin, binanceUsdtBalance, Exchange.Binance);
  }

  /** KUCOIN */
  for (const coin of kuCoinCoins) {
    await startBuyOrder(coin, kuCoinUsdtBalance, Exchange.KuCoin);
  }
};

const startSellSequence = async () => {
  /** Get the balances of all coins on binance */
  const binanceCoinsBalances = await BinanceService.getCoinBalances(
    binanceCoins,
  );

  /** Get the balances of all coins on kuCoin */
  const kuCoinCoinsBalances = await KuCoinService.getCoinBalances(kuCoinCoins);

  /** For each coin, we want to start a sell order */

  /** BINANCE */
  for (const coin of binanceCoins) {
    const balance = binanceCoinsBalances.find((b) => b.base === coin.base);
    await startSellOrder(coin, balance, Exchange.Binance);
  }

  /** KUCOIN */
  for (const coin of kuCoinCoins) {
    const balance = kuCoinCoinsBalances.find((b) => b.base === coin.base);
    await startSellOrder(coin, balance, Exchange.KuCoin);
  }
};

/** ======================================================== Start ======================================================== */

const start = async () => {
  binanceCoins = getUsableCoins(Exchange.Binance);
  kuCoinCoins = getUsableCoins(Exchange.KuCoin);

  binanceDemicalPositions = await BinanceService.getCoinDecimals(binanceCoins);
  kuCoinDemicalPositions = await KuCoinService.getCoinDecimals(kuCoinCoins);

  switch (orderType) {
    case OrderType.Buy:
      await startBuySequence();
      return;

    case OrderType.Sell:
      await startSellSequence();
  }
};

start();
