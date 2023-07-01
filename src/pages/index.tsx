// index.tsx
import { GetServerSideProps } from 'next'
import axios from 'axios'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

export default function Home() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true')
  const btcData = response.data.bitcoin;
  const btcPriceNow = btcData.usd;
  const btc24hrChange = btcData.usd_24h_change;
  const btcPrice24hrAgo = btcPriceNow / (1 + btc24hrChange / 100);

  const ethData = response.data.ethereum;
  const ethPriceNow = ethData.usd;
  const eth24hrChange = ethData.usd_24h_change;
  const ethPrice24hrAgo = ethPriceNow / (1 + eth24hrChange / 100);

  const date = new Date()
  const pubDate = format(utcToZonedTime(date, 'GMT'), 'EEE, dd MMM yyyy HH:mm:ss xx')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Your Cryptocurrency Price Monitoring RSS Feed</title>
      <link>https://bankkrss.vercel.app/</link>
      <description>Keep track of the daily changes in Bitcoin and Ethereum prices</description>
      <atom:link href="https://bankkrss.vercel.app/" rel="self" type="application/rss+xml" />
      <language>en</language>
      <pubDate>${pubDate}</pubDate>
      <item>
        <title>24-hour BTC Change</title>
        <link>https://bankkrss.vercel.app/btc</link>
        <description>Bitcoin - Price 24 hours ago: $${new Intl.NumberFormat().format(btcPrice24hrAgo)}, Current price: $${new Intl.NumberFormat().format(btcPriceNow)}, 24h change: ${btc24hrChange.toFixed(2)}%.</description>
        <pubDate>${pubDate}</pubDate>
      </item>
      <item>
        <title>24-hour ETH Change</title>
        <link>https://bankkrss.vercel.app/eth</link>
        <description>Ethereum - Price 24 hours ago: $${new Intl.NumberFormat().format(ethPrice24hrAgo)}, Current price: $${new Intl.NumberFormat().format(ethPriceNow)}, 24h change: ${eth24hrChange.toFixed(2)}%.</description>
      </item>
    </channel>
  </rss>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()
} catch (error) {
  console.error("Error fetching data: ", error)
  res.statusCode = 500
  res.end()
}

return {
  props: {},
}
}
