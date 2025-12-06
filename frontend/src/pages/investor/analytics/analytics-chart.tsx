import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// types
import { ChartDataPoint } from '../investments/types';

// ----------------------------------------------------------------------

interface AnalyticsChartProps {
  data: ChartDataPoint[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  // Простая визуализация данных (можно заменить на библиотеку типа recharts)
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => Math.max(d.invested, d.projected, d.profit))),
    [data]
  );

  return (
    <Box sx={{ mt: 3 }}>
      {data.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
          Нет данных для отображения
        </Typography>
      ) : (
        <Stack spacing={2}>
          {data.map((point, index) => {
            const investedPercent = (point.invested / maxValue) * 100;
            const projectedPercent = (point.projected / maxValue) * 100;
            const profitPercent = (point.profit / maxValue) * 100;

            return (
              <Box key={index}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 120 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(point.date).toLocaleDateString('ru-RU', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack spacing={0.5}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Вложено
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            ${point.invested.toFixed(2)}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 8,
                            bgcolor: 'primary.lighter',
                            borderRadius: 1,
                            width: `${investedPercent}%`,
                          }}
                        />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Прогноз
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ${point.projected.toFixed(2)}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 8,
                            bgcolor: 'success.lighter',
                            borderRadius: 1,
                            width: `${projectedPercent}%`,
                          }}
                        />
                      </Box>
                      {point.profit > 0 && (
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Прибыль
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
                              ${point.profit.toFixed(2)}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'info.lighter',
                              borderRadius: 1,
                              width: `${profitPercent}%`,
                            }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

