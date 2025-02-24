interface ChartDataPoint {
  time: Date;
  price: number;
  amount: number;
}

const chartDataStore: { [tokenId: string]: ChartDataPoint[] } = {};

export const addChartDataPoint = (tokenId: string, price: number, amount: number) => {
  const newPoint: ChartDataPoint = {
    time: new Date(),
    price,
    amount,
  };

  if (!chartDataStore[tokenId]) {
    chartDataStore[tokenId] = [];
  }

  chartDataStore[tokenId].push(newPoint);
};

export const getChartData = (tokenId: string) => {
  return chartDataStore[tokenId] || [];
}; 