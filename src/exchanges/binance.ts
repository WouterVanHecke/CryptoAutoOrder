import { Spot as BinanceConnector } from '@binance/connector';
import {
  Balance,
  BinanceBalance,
  BinanceSymbol,
  Coin,
  Decimal,
  OrderType,
} from '../types';
import { QUOTE } from '..';

import dotenv from 'dotenv';
dotenv.config();

/** Initialize Binance */
const binanceApiKey = process.env.BINANCE_KEY;
const binanceApiSecret = process.env.BINANCE_SECRET;
const Binance = new BinanceConnector(binanceApiKey, binanceApiSecret);

export const getCoinDecimals = async (coins: Coin[]) => {
  const binancePairs = coins.map((c) => createPair(c.base));

  const binanceDemicalPositions: Decimal[] = (
    await Binance.exchangeInfo()
  ).data.symbols
    .filter((s: BinanceSymbol) => binancePairs.includes(s.symbol))
    .map((s: BinanceSymbol) => {
      const stepSize: string =
        s.filters.find((f) => f.filterType === 'LOT_SIZE')?.stepSize || '1';

      const decimalPosition = stepSize.indexOf('1');
      const decimal =
        decimalPosition !== 0 ? decimalPosition - 1 : decimalPosition;

      return {
        pair: s.symbol,
        decimal,
      };
    });

  return binanceDemicalPositions;
};

export const getUsdtBalance = async () => {
  const clientResponse = await Binance.account();
  const clientBalances = clientResponse.data.balances;
  const binanceUsdtBalance = parseInt(
    clientBalances.find((b: BinanceBalance) => b.asset === 'USDT').free,
  );

  return binanceUsdtBalance;
};

export const getCoinBalances = async (coins: Coin[]) => {
  const clientResponse = await Binance.account();
  const clientBalances = clientResponse.data.balances;
  const binanceBaseCoins = coins.map((c) => c.base);
  const binanceCoinsBalances: Balance[] = clientBalances
    .filter((b: BinanceBalance) => binanceBaseCoins.includes(b.asset))
    .map((b: BinanceBalance) => ({
      base: b.asset,
      balance: parseFloat(b.free),
    }));

  return binanceCoinsBalances;
};

/** Pair === BASEQUOTE */
export const getPrice = async (base: string) => {
  const priceResponse = await Binance.avgPrice(createPair(base));
  const price = priceResponse.data.price;

  return price;
};

/**
 * Pair === BASEQUOTE
 * Pick either quantity (BASE) or quoteOrderQty (QUOTE)
 */
export const startOrder = async (
  base: string,
  orderType: OrderType,
  quantity: { quantity?: number; quoteOrderQty?: number },
  price: number,
) => {
  const result = await Binance.newOrder(
    createPair(base),
    orderType,
    'MARKET',
    quantity,
  );

  const totalBalance = parseFloat((result.data.executedQty * price).toFixed(4));

  console.log(`${orderType} order was successfull!`);
  console.log(`Total balance: ${totalBalance} USDT`);
  console.log(`Amount bought: ${result.data.executedQty} ${base}`);
  console.log(`Price of: ${price} USDT\n`);
};

export const createPair = (base: string) => `${base}${QUOTE}`;
