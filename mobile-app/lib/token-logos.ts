import type { ImageSourcePropType } from 'react-native';

// Bundled logos (from CoinGecko), because Perpl's market `icon` field is empty.
// Static requires so Metro bundles them; unknown symbols fall back to text.
const LOGOS: Record<string, ImageSourcePropType> = {
  BTC: require('../assets/tokens/btc.png'),
  ETH: require('../assets/tokens/eth.png'),
  MON: require('../assets/tokens/mon.png'),
  SOL: require('../assets/tokens/sol.png'),
  HYPE: require('../assets/tokens/hype.jpg'),
  ZEC: require('../assets/tokens/zec.png'),
  NEAR: require('../assets/tokens/near.jpg'),
  UNI: require('../assets/tokens/uni.png'),
  PUMP: require('../assets/tokens/pump.jpg'),
  LIT: require('../assets/tokens/lit.png'),
  VVV: require('../assets/tokens/vvv.png'),
};

export const tokenLogo = (symbol: string) => LOGOS[symbol.toUpperCase()];
