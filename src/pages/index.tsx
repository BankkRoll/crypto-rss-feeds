// index.tsx

import { GetServerSideProps } from 'next'
import axios from 'axios'

export default function Home() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch the current price, 24hr volume, 24hr change, and market cap for bitcoin and ethereum
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true')

  const btcData = response.data.bitcoin;
  const btcPriceNow = btcData.usd;
  const btc24hrChange = btcData.usd_24h_change;
  const btcPrice24hrAgo = btcPriceNow / (1 + btc24hrChange / 100);

  const ethData = response.data.ethereum;
  const ethPriceNow = ethData.usd;
  const eth24hrChange = ethData.usd_24h_change;
  const ethPrice24hrAgo = ethPriceNow / (1 + eth24hrChange / 100);

  // Generate the XML for the RSS feed
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:crypto="https://bankkrss.vercel.app/xmlns">
    <channel>
        <author>BankkRoll.eth</author>
        <title>Your Cryptocurrency Price Monitoring RSS Feed</title>
        <description>Keep track of the daily changes in Bitcoin and Ethereum prices</description>
        <link>https://bankkrss.vercel.app/</link>
      <item>
        <title>24-hour BTC Change</title>
        <crypto:price_24hr_ago>$${new Intl.NumberFormat().format(btcPrice24hrAgo)}</crypto:price_24hr_ago>
        <crypto:current_price>$${new Intl.NumberFormat().format(btcPriceNow)}</crypto:current_price>
        <crypto:change_24hr>${btc24hrChange.toFixed(2)}%</crypto:change_24hr>
        <description>For a detailed chart visit the /btc link.</description>
        <link>https://bankkrss.vercel.app/btc</link>
      </item>
      <item>
        <title>24-hour ETH Change</title>
        <crypto:price_24hr_ago>$${new Intl.NumberFormat().format(ethPrice24hrAgo)}</crypto:price_24hr_ago>
        <crypto:current_price>$${new Intl.NumberFormat().format(ethPriceNow)}</crypto:current_price>
        <crypto:change_24hr>${eth24hrChange.toFixed(2)}%</crypto:change_24hr>
        <description>For a detailed chart visit the /eth link.</description>
        <link>https://bankkrss.vercel.app/eth</link>
      </item>
    </channel>
  </rss>`


  // Set the content type to 'text/xml'
  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()

  return {
    props: {},
  }
}
