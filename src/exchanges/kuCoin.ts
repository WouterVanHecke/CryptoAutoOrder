import KuCoin from 'kucoin-node-sdk';
import uuid4 from 'uuid4';

import {
  Balance,
  Coin,
  Decimal,
  KuCoinBalance,
  KuCoinSymbol,
  OrderType,
} from '../types';
import { QUOTE } from '..';

import dotenv from 'dotenv';
dotenv.config();

/** Initialize KuCoin */
const kuCoinBaseUrl = 'https://api.kucoin.com';
const kuCoinApiKey = process.env.KUCOIN_KEY;
const kuCoinApiSecret = process.env.KUCOIN_SECRET;
const kuCoinApiPassphrase = process.env.KUCOIN_PASSPHRASE;

KuCoin.init({
  baseUrl: kuCoinBaseUrl,
  apiAuth: {
    key: kuCoinApiKey,
    secret: kuCoinApiSecret,
    passphrase: kuCoinApiPassphrase,
  },
  authVersion: 2,
});

export const getCoinDecimals = async (coins: Coin[]) => {
  const kuCoinPairs = coins.map((c) => createPair(c.base));

  const kuCoinDemicalPositions: Decimal[] = (
    await KuCoin.rest.Market.Symbols.getSymbolsList()
  ).data
    .filter((s: KuCoinSymbol) => kuCoinPairs.includes(s.symbol))
    .map((s: KuCoinSymbol) => {
      const decimalPosition = s.baseIncrement.indexOf('1');
      const decimal =
        decimalPosition !== 0 ? decimalPosition - 1 : decimalPosition;

      return {
        pair: s.symbol,
        decimal,
      };
    });

  return kuCoinDemicalPositions;
};

export const getUsdtBalance = async () => {
  const kuCoinAccountResponse =
    await KuCoin.rest.User.Account.getAccountsList();
  const kuCoinAccountBalances = kuCoinAccountResponse.data;
  const kuCoinUsdtBalance = parseInt(
    kuCoinAccountBalances.find(
      (b: KuCoinBalance) => b.currency === 'USDT' && b.type === 'trade',
    ).available,
  );

  return kuCoinUsdtBalance;
};

export const getCoinBalances = async (coins: Coin[]) => {
  const kuCoinAccountResponse =
    await KuCoin.rest.User.Account.getAccountsList();
  const kuCoinAccountBalances = kuCoinAccountResponse.data;
  const kuCoinBaseCoins = coins.map((c) => c.base);
  const kuCoinCoinsBalances: Balance[] = kuCoinAccountBalances
    .filter(
      (b: KuCoinBalance) =>
        kuCoinBaseCoins.includes(b.currency) && b.type === 'trade',
    )
    .map((b: KuCoinBalance) => ({
      base: b.currency,
      balance: parseFloat(b.available),
    }));

  return kuCoinCoinsBalances;
};

/** Pair === BASE-QUOTE */
export const getPrice = async (base: string) => {
  const priceResponse = await KuCoin.rest.Market.Symbols.getTicker(
    createPair(base),
  );
  const price = parseFloat(priceResponse.data.price);

  return price;
};

/**
 * Pair === BASE-QUOTE
 * Pick either size (BASE) or funds (QUOTE)
 */
export const startOrder = async (
  base: string,
  orderType: OrderType,
  quantity: { size?: number; funds?: number },
  price: number,
) => {
  await KuCoin.rest.Trade.Orders.postOrder(
    {
      clientOid: uuid4(),
      side: orderType.toLocaleLowerCase(),
      symbol: createPair(base),
      type: 'market',
    },
    {
      /** KuCoin needs to values as strings *sigh* */
      ...(quantity.size && { size: quantity.size.toString() }),
      ...(quantity.funds && { size: quantity.funds.toString() }),
    },
  );

  const totalBalance =
    quantity.funds ||
    (quantity.size ? parseFloat((quantity.size * price).toFixed(4)) : 0);

  console.log(`${orderType} order was successfull!`);
  console.log(`Total balance: ${totalBalance} USDT`);
  console.log(`Amount bought: ${quantity} ${base}`);
  console.log(`Price of: ${price} USDT\n`);
};

export const createPair = (base: string) => `${base}-${QUOTE}`;
