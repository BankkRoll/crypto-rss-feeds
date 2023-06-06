// eth.tsx

import { GetServerSideProps } from 'next'
import axios from 'axios'
import querystring from 'querystring'
import { format } from 'date-fns'

export default function Ethereum() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch the cryptocurrency data from the CoinGecko API
  const ethResponse = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart', {
    params: {
      vs_currency: 'usd',
      days: 1,
    },
  })

  const ethPrices = ethResponse.data.prices

  // A helper function to round the timestamp down to the nearest hour
  const roundToNearestHour = (timestamp: number) => Math.floor(timestamp / 3600000) * 3600000;

  // Generate a map where the key is the hour and the value is the most recent price in that hour
  const hourlyEthPrices = ethPrices.reduce((acc: any, price: any[]) => {
    const hour = roundToNearestHour(price[0]);
    acc[hour] = price[1];
    return acc;
  }, {});

  // Generate a chart configuration for QuickChart
  const ethChartConfig = {
    type: 'line',
    data: {
      labels: Object.keys(hourlyEthPrices).map(hour => new Date(parseInt(hour)).toLocaleTimeString()),
      datasets: [
        {
          label: 'ETH',
          data: Object.values(hourlyEthPrices),
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          fill: true,
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
  const ethChartUrl = `https://quickchart.io/chart?${querystring.stringify({
    c: JSON.stringify(ethChartConfig),
    width: 600,
    height: 300,
  })}`

  const xmlSafeEthUrl = ethChartUrl.replace(/&/g, '&amp;');

    // ETH RSS XML
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
    <channel>
        <title>ETH Price Monitoring RSS Feed</title>
        <description>24HR changes in Ethereum prices</description>
        <link>https://bankkrss.vercel.app/eth</link>
        <language>en</language>
        <pubDate>${new Date().toUTCString()}</pubDate>
      <item>
        <title>24-hour ETH Prices</title>
        <description><img src="${xmlSafeEthUrl}" alt="Ethereum Prices"/></description>
        <link>https://bankkrss.vercel.app/eth</link>
        <guid>https://bankkrss.vercel.app/eth</guid>
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
