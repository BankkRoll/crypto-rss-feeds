// btc.tsx

import { GetServerSideProps } from 'next'
import axios from 'axios'
import querystring from 'querystring'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

export default function Bitcoin() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch the cryptocurrency data from the CoinGecko API
  const btcResponse = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
    params: {
      vs_currency: 'usd',
      days: 1,
    },
  })

  const btcPrices = btcResponse.data.prices

  // A helper function to round the timestamp down to the nearest hour
  const roundToNearestHour = (timestamp: number) => Math.floor(timestamp / 3600000) * 3600000;

  // Generate a map where the key is the hour and the value is the most recent price in that hour
  const hourlyBtcPrices = btcPrices.reduce((acc: any, price: any[]) => {
    const hour = roundToNearestHour(price[0]);
    acc[hour] = price[1];
    return acc;
  }, {});

  // Generate a chart configuration for QuickChart
  const btcChartConfig = {
    type: 'line',
    data: {
      labels: Object.keys(hourlyBtcPrices).map(hour => new Date(parseInt(hour)).toLocaleTimeString()),
      datasets: [
        {
          label: 'BTC',
          data: Object.values(hourlyBtcPrices),
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)', // This will make the area under the line filled with a light blue color
          fill: true, // This will make the area under the line filled
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price (USD$)',
          }
        },
      },
    },
  }

  // Create a URL for the chart images
  const btcChartUrl = `https://quickchart.io/chart?${querystring.stringify({
    c: JSON.stringify(btcChartConfig),
    width: 600,
    height: 300,
  })}`

  const xmlSafeBtcUrl = btcChartUrl.replace(/&/g, '&amp;');

    // BTC RSS XML
    const date = new Date()
    const pubDate = format(utcToZonedTime(date, 'GMT'), 'EEE, dd MMM yyyy HH:mm:ss xx')
    
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>BTC Price Monitoring RSS Feed</title>
        <link>https://bankkrss.vercel.app/btc</link>
        <description>24HR changes in Bitcoin prices</description>
        <atom:link href="https://bankkrss.vercel.app/btc" rel="self" type="application/rss+xml" />
        <language>en</language>
        <pubDate>${pubDate}</pubDate>
      <item>
        <title>24-hour BTC Prices</title>
        <link>https://bankkrss.vercel.app/btc</link>
        <description>${xmlSafeBtcUrl}</description>
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
