export type Coin = { base: string; amount: number | string };

export interface Config {
  binance?: Array<Coin>;
  kuCoin?: Array<Coin>;
}

export type BinanceBalance = {
  asset: string;
  free: string;
  locked: string;
};

export type KuCoinBalance = {
  id: string;
  currency: string;
  type: string;
  balance: string;
  available: string;
  holds: string;
};

export type Balance = {
  base: string;
  balance: number;
};

export type Decimal = {
  pair: string;
  decimal: number;
};

export enum Exchange {
  Binance = 'binance',
  KuCoin = 'kuCoin',
}

export enum OrderType {
  Buy = 'BUY',
  Sell = 'SELL',
}

export type KuCoinSymbol = {
  symbol: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  feeCurrency: string;
  market: string;
  baseMinSize: string;
  quoteMinSize: string;
  baseMaxSize: string;
  quoteMaxSize: string;
  baseIncrement: string;
  quoteIncrement: string;
  priceIncrement: string;
  priceLimitRate: string;
  minFunds: string;
  isMarginEnabled: boolean;
  enableTrading: boolean;
};

export type BinanceSymbol = {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: 8;
  quoteAsset: string;
  quotePrecision: 8;
  quoteAssetPrecision: 8;
  baseCommissionPrecision: 8;
  quoteCommissionPrecision: 8;
  orderTypes: string[];
  icebergAllowed: true;
  ocoAllowed: true;
  quoteOrderQtyMarketAllowed: true;
  allowTrailingStop: true;
  cancelReplaceAllowed: true;
  isSpotTradingAllowed: true;
  isMarginTradingAllowed: true;
  filters: Array<{
    filterType: string;
    stepSize: string;
    /** And other stuff we won't use */
  }>;
  permissions: string[];
  defaultSelfTradePreventionMode: string;
  allowedSelfTradePreventionModes: string[];
};
