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
          borderColor: 'orange',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
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
  const btcChartUrl = `https://quickchart.io/chart?${querystring.stringify({
    c: JSON.stringify(btcChartConfig),
    width: 600,
    height: 300,
  })}`

  const xmlSafeBtcUrl = btcChartUrl.replace(/&/g, '&amp;');

    // BTC RSS XML
    const date = new Date()
    const pubDate = format(utcToZonedTime(date, 'GMT'), 'EEE, dd MMM yyyy HH:mm:ss xx')

  // Fetch the current bitcoin price and 24 hour change from CoinGecko API
  const btcPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
  const btcData = btcPriceResponse.data.bitcoin;
  const btcPriceNow = btcData.usd;
  const btc24hrChange = btcData.usd_24h_change;
  const btcPrice24hrAgo = btcPriceNow / (1 + btc24hrChange / 100);

  const btcTitle = `<![CDATA[
    **24-hour BTC Change**
    > **Price 24 hours ago:** $${new Intl.NumberFormat().format(btcPrice24hrAgo)}
    > **Current price:** $${new Intl.NumberFormat().format(btcPriceNow)}
    > **24h change:** ${btc24hrChange.toFixed(2)}%
    ]]>`;


  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${btcTitle}</title>
        <link>https://bankkrss.vercel.app/btc</link>
        <description>${btcTitle}</description>
        <atom:link href="https://bankkrss.vercel.app/btc" rel="self" type="application/rss+xml" />
        <language>en</language>
        <pubDate>${pubDate}</pubDate>
      <item>
        <title>${btcTitle}</title>
        <link>https://bankkrss.vercel.app/btc</link>
        <description>${xmlSafeBtcUrl}</description>
        <pubDate>${pubDate}</pubDate>
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
