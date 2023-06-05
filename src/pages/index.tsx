// index.tsx

import { GetServerSideProps } from 'next'
import axios from 'axios'

export default function Home() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
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
  <rss version="2.0">
    <channel>
      <title>Your Cryptocurrency Price Monitoring RSS Feed</title>
      <summary>Keep track of the daily changes in Bitcoin and Ethereum prices</summary>
      <link>https://bankkrss.vercel.app/</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <item>
        <title>24-hour BTC Change</title>
        <summary><strong>Bitcoin</strong> - Price 24 hours ago: <strong>$${new Intl.NumberFormat().format(btcPrice24hrAgo)}</strong>, Current price: <strong>$${new Intl.NumberFormat().format(btcPriceNow)}</strong>, 24h change: <strong>${btc24hrChange.toFixed(2)}%</strong>.</summary>
        <link>https://bankkrss.vercel.app/btc</link>
      </item>
      <item>
        <title>24-hour ETH Change</title>
        <summary><strong>Ethereum</strong> - Price 24 hours ago: <strong>$${new Intl.NumberFormat().format(ethPrice24hrAgo)}</strong>, Current price: <strong>$${new Intl.NumberFormat().format(ethPriceNow)}</strong>, 24h change: <strong>${eth24hrChange.toFixed(2)}%</strong>.</summary>
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
